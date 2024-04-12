import { Base64, RpcMethod } from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors/ton-connect.error';
import { BridgeIncomingMessage } from 'src/provider/bridge/models/bridge-incomming-message';
import { HttpBridgeGatewayStorage } from 'src/storage/http-bridge-gateway-storage';
import { IStorage } from 'src/storage/models/storage.interface';
import { addPathToUrl } from 'src/utils/url';
import '@tonconnect/isomorphic-eventsource';
import '@tonconnect/isomorphic-fetch';
import { callForSuccess } from 'src/utils/call-for-success';
import { logDebug, logError } from 'src/utils/log';
import { delay } from 'src/utils/delay';
import { createResource } from 'src/utils/resource';
import { createAbortController, defer } from 'src/utils/defer';

type CreateEventSourceOptions = {
    openingDeadlineMS?: number;
    signal?: AbortSignal;
};

export class BridgeGateway {
    private readonly ssePath = 'events';

    private readonly postPath = 'message';

    private readonly heartbeatMessage = 'heartbeat';

    private readonly defaultTtl = 300;

    private eventSource = createResource(
        async (signal: AbortSignal, options?: CreateEventSourceOptions): Promise<EventSource> => {
            const eventSourceConfig = {
                bridgeUrl: this.bridgeUrl,
                ssePath: this.ssePath,
                sessionId: this.sessionId,
                bridgeGatewayStorage: this.bridgeGatewayStorage,
                errorHandler: this.errorsHandler.bind(this),
                messageHandler: this.messagesHandler.bind(this),
                signal: signal
            };
            return await createEventSource(eventSourceConfig, options);
        },
        async (resource: EventSource) => {
            resource.close();
        }
    );

    private get isReady(): boolean {
        const eventSource = this.eventSource.current();
        return eventSource?.readyState === EventSource.OPEN;
    }

    private get isClosed(): boolean {
        const eventSource = this.eventSource.current();
        return eventSource?.readyState !== EventSource.OPEN;
    }

    private get isConnecting(): boolean {
        const eventSource = this.eventSource.current();
        return eventSource?.readyState === EventSource.CONNECTING;
    }

    private readonly bridgeGatewayStorage: HttpBridgeGatewayStorage;

    constructor(
        storage: IStorage,
        public readonly bridgeUrl: string,
        public readonly sessionId: string,
        private listener: (msg: BridgeIncomingMessage) => void,
        private errorsListener: (err: Event) => void
    ) {
        this.bridgeGatewayStorage = new HttpBridgeGatewayStorage(storage, bridgeUrl);
    }

    public async registerSession(options?: CreateEventSourceOptions): Promise<void> {
        await this.eventSource.create(options);
    }

    public async send(
        message: Uint8Array,
        receiver: string,
        topic: RpcMethod,
        options?: {
            ttl?: number;
            signal?: AbortSignal;
        }
    ): Promise<void>;
    /** @deprecated use send(message, receiver, topic, options) instead */
    public async send(
        message: Uint8Array,
        receiver: string,
        topic: RpcMethod,
        ttl?: number
    ): Promise<void>;
    public async send(
        message: Uint8Array,
        receiver: string,
        topic: RpcMethod,
        ttlOrOptions?: number | { ttl?: number; signal?: AbortSignal }
    ): Promise<void> {
        // TODO: remove deprecated method
        const options: { ttl?: number; signal?: AbortSignal } = {};
        if (typeof ttlOrOptions === 'number') {
            options.ttl = ttlOrOptions;
        } else {
            options.ttl = ttlOrOptions?.ttl;
            options.signal = ttlOrOptions?.signal;
        }

        const url = new URL(addPathToUrl(this.bridgeUrl, this.postPath));
        url.searchParams.append('client_id', this.sessionId);
        url.searchParams.append('to', receiver);
        url.searchParams.append('ttl', (options?.ttl || this.defaultTtl).toString());
        url.searchParams.append('topic', topic);
        const body = Base64.encode(message);

        await callForSuccess(
            async options => {
                const response = await this.post(url, body, options.signal);

                if (!response.ok) {
                    throw new TonConnectError(`Bridge send failed, status ${response.status}`);
                }
            },
            { attempts: Number.MAX_SAFE_INTEGER, delayMs: 5_000, signal: options?.signal }
        );
    }

    public pause(): void {
        this.eventSource?.dispose();
    }

    public async unPause(): Promise<void> {
        await this.eventSource.recreate();
    }

    public async close(): Promise<void> {
        await this.eventSource.dispose();
    }

    public setListener(listener: (msg: BridgeIncomingMessage) => void): void {
        this.listener = listener;
    }

    public setErrorsListener(errorsListener: (err: Event) => void): void {
        this.errorsListener = errorsListener;
    }

    private async post(url: URL, body: string, signal?: AbortSignal): Promise<Response> {
        const response = await fetch(url, {
            method: 'post',
            body: body,
            signal: signal
        });

        if (!response.ok) {
            throw new TonConnectError(`Bridge send failed, status ${response.status}`);
        }

        return response;
    }

    private async errorsHandler(e: Event): Promise<void> {
        if (this.isConnecting) {
            logError('Bridge error', JSON.stringify(e));
            return;
        }

        if (this.isReady) {
            this.errorsListener(e);
            return;
        }

        if (this.isClosed) {
            logDebug('Bridge reconnecting, 200ms delay');
            await delay(200);
            await this.eventSource.recreate();
            return;
        }
    }

    private async messagesHandler(e: MessageEvent<string>): Promise<void> {
        if (e.data === this.heartbeatMessage) {
            return;
        }

        await this.bridgeGatewayStorage.storeLastEventId(e.lastEventId);

        if (this.isClosed) {
            return;
        }

        let bridgeIncomingMessage: BridgeIncomingMessage;
        try {
            bridgeIncomingMessage = JSON.parse(e.data);
        } catch (e) {
            throw new TonConnectError(`Bridge message parse failed, message ${e.data}`);
        }
        this.listener(bridgeIncomingMessage);
    }
}

async function createEventSource(
    config: {
        bridgeUrl: string;
        ssePath: string;
        sessionId: string;
        bridgeGatewayStorage: HttpBridgeGatewayStorage;
        errorHandler: (e: Event) => void;
        messageHandler: (e: MessageEvent<string>) => void;
        signal: AbortSignal;
    },
    options?: CreateEventSourceOptions
): Promise<EventSource> {
    return await defer(
        async (resolve, reject, deferOptions) => {
            const abortController = createAbortController(deferOptions.signal);
            const signal = abortController.signal;

            if (signal.aborted) {
                reject(new TonConnectError('Bridge connection aborted'));
                return;
            }

            const url = new URL(addPathToUrl(config.bridgeUrl, config.ssePath));
            url.searchParams.append('client_id', config.sessionId);

            const lastEventId = await config.bridgeGatewayStorage.getLastEventId();
            if (lastEventId) {
                url.searchParams.append('last_event_id', lastEventId);
            }

            if (signal.aborted) {
                reject(new TonConnectError('Bridge connection aborted'));
                return;
            }

            const eventSource = new EventSource(url.toString());

            eventSource.onerror = (reason: Event): void => {
                if (signal.aborted) {
                    reject(new TonConnectError('Bridge connection aborted'));
                    return;
                }

                config.errorHandler(reason);
            };
            eventSource.onopen = (): void => {
                if (signal.aborted) {
                    reject(new TonConnectError('Bridge connection aborted'));
                    return;
                }
                resolve(eventSource);
            };
            eventSource.onmessage = (event: MessageEvent<string>): void => {
                config.messageHandler(event);
            };

            config?.signal?.addEventListener('abort', () => {
                logError('Bridge connection aborted');
                eventSource.close();
                reject(new TonConnectError('Bridge connection aborted'));
            });
        },
        { timeout: options?.openingDeadlineMS, signal: config?.signal }
    );
}

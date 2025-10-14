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
import { createResource } from 'src/utils/resource';
import { timeout } from 'src/utils/timeout';
import { createAbortController } from 'src/utils/create-abort-controller';
import { AnalyticsManager } from 'src/analytics/analytics-manager';
import { Analytics } from 'src/analytics/analytics';
import { BridgeClientEvent } from 'src/analytics/types';

export class BridgeGateway {
    private readonly ssePath = 'events';

    private readonly postPath = 'message';

    private readonly heartbeatMessage = 'heartbeat';

    private readonly defaultTtl = 300;

    private readonly defaultReconnectDelay = 2000;

    private readonly defaultResendDelay = 5000;

    private eventSource = createResource(
        async (signal?: AbortSignal, openingDeadlineMS?: number): Promise<EventSource> => {
            const eventSourceConfig = {
                bridgeUrl: this.bridgeUrl,
                ssePath: this.ssePath,
                sessionId: this.sessionId,
                bridgeGatewayStorage: this.bridgeGatewayStorage,
                errorHandler: this.errorsHandler.bind(this),
                messageHandler: this.messagesHandler.bind(this),
                signal: signal,
                openingDeadlineMS: openingDeadlineMS
            };
            return await createEventSource(eventSourceConfig);
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
    private readonly analytics?: Analytics<BridgeClientEvent, 'bridge_url' | 'client_id'>;

    constructor(
        storage: IStorage,
        public readonly bridgeUrl: string,
        public readonly sessionId: string,
        private listener: (msg: BridgeIncomingMessage) => void,
        private errorsListener: (err: Event) => void,
        analyticsManager?: AnalyticsManager
    ) {
        this.bridgeGatewayStorage = new HttpBridgeGatewayStorage(storage, bridgeUrl);
        this.analytics = analyticsManager?.scoped('http-bridge', {
            bridge_url: bridgeUrl,
            client_id: sessionId
        });
    }

    public async registerSession(options?: RegisterSessionOptions): Promise<void> {
        try {
            this.analytics?.emitBridgeClientConnectStarted({});
            const connectionStarted = Date.now();
            await this.eventSource.create(options?.signal, options?.openingDeadlineMS);

            const bridgeConnectDuration = Date.now() - connectionStarted;
            this.analytics?.emitBridgeClientConnectEstablished({
                bridge_connect_duration: bridgeConnectDuration
            });
        } catch (error) {
            this.analytics?.emitBridgeClientConnectError({
                error_message: String(error)
            });
        }
    }

    public async send(
        message: Uint8Array,
        receiver: string,
        topic: RpcMethod,
        options?: {
            ttl?: number;
            signal?: AbortSignal;
            attempts?: number;
            messageId?: string;
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
        ttlOrOptions?:
            | number
            | { ttl?: number; signal?: AbortSignal; attempts?: number; messageId?: string }
    ): Promise<void> {
        // TODO: remove deprecated method
        const options: { ttl?: number; signal?: AbortSignal; attempts?: number } = {};
        if (typeof ttlOrOptions === 'number') {
            options.ttl = ttlOrOptions;
        } else {
            options.ttl = ttlOrOptions?.ttl;
            options.signal = ttlOrOptions?.signal;
            options.attempts = ttlOrOptions?.attempts;
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
            {
                attempts: options?.attempts ?? Number.MAX_SAFE_INTEGER,
                delayMs: this.defaultResendDelay,
                signal: options?.signal
            }
        );
    }

    public pause(): void {
        this.eventSource.dispose().catch(e => logError(`Bridge pause failed, ${e}`));
    }

    public async unPause(): Promise<void> {
        const RECREATE_WITHOUT_DELAY = 0;
        await this.eventSource.recreate(RECREATE_WITHOUT_DELAY);
    }

    public async close(): Promise<void> {
        await this.eventSource.dispose().catch(e => logError(`Bridge close failed, ${e}`));
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

    private async errorsHandler(eventSource: EventSource, e: Event): Promise<EventSource | void> {
        if (this.isConnecting) {
            eventSource.close();
            throw new TonConnectError('Bridge error, failed to connect');
        }

        if (this.isReady) {
            try {
                this.errorsListener(e);
            } catch (e) {}
            return;
        }

        if (this.isClosed) {
            eventSource.close();
            logDebug(`Bridge reconnecting, ${this.defaultReconnectDelay}ms delay`);
            return await this.eventSource.recreate(this.defaultReconnectDelay);
        }

        throw new TonConnectError('Bridge error, unknown state');
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
        } catch (_) {
            throw new TonConnectError(`Bridge message parse failed, message ${e.data}`);
        }
        this.listener(bridgeIncomingMessage);
    }
}

/**
 * Represents options for creating an event source.
 */
export type RegisterSessionOptions = {
    /**
     * Deadline for opening the event source.
     */
    openingDeadlineMS?: number;

    /**
     * Signal to abort the operation.
     */
    signal?: AbortSignal;
};

/**
 * Configuration for creating an event source.
 */
export type CreateEventSourceConfig = {
    /**
     * URL of the bridge.
     */
    bridgeUrl: string;
    /**
     * Path to the SSE endpoint.
     */
    ssePath: string;
    /**
     * Session ID of the client.
     */
    sessionId: string;
    /**
     * Storage for the last event ID.
     */
    bridgeGatewayStorage: HttpBridgeGatewayStorage;
    /**
     * Error handler for the event source.
     */
    errorHandler: (eventSource: EventSource, e: Event) => Promise<EventSource | void>;
    /**
     * Message handler for the event source.
     */
    messageHandler: (e: MessageEvent<string>) => void;
    /**
     * Signal to abort opening the event source and destroy it.
     */
    signal?: AbortSignal;
    /**
     * Deadline for opening the event source.
     */
    openingDeadlineMS?: number;
};

/**
 * Creates an event source.
 * @param {CreateEventSourceConfig} config - Configuration for creating an event source.
 */
async function createEventSource(config: CreateEventSourceConfig): Promise<EventSource> {
    return await timeout(
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

            eventSource.onerror = async (reason: Event): Promise<void> => {
                if (signal.aborted) {
                    eventSource.close();
                    reject(new TonConnectError('Bridge connection aborted'));
                    return;
                }

                try {
                    const newInstance = await config.errorHandler(eventSource, reason);
                    if (newInstance !== eventSource) {
                        eventSource.close();
                    }

                    if (newInstance && newInstance !== eventSource) {
                        resolve(newInstance);
                    }
                } catch (e) {
                    eventSource.close();
                    reject(e);
                }
            };
            eventSource.onopen = (): void => {
                if (signal.aborted) {
                    eventSource.close();
                    reject(new TonConnectError('Bridge connection aborted'));
                    return;
                }
                resolve(eventSource);
            };
            eventSource.onmessage = (event: MessageEvent<string>): void => {
                if (signal.aborted) {
                    eventSource.close();
                    reject(new TonConnectError('Bridge connection aborted'));
                    return;
                }
                config.messageHandler(event);
            };

            config.signal?.addEventListener('abort', () => {
                eventSource.close();
                reject(new TonConnectError('Bridge connection aborted'));
            });
        },
        { timeout: config.openingDeadlineMS, signal: config.signal }
    );
}

import { Base64, RpcMethod } from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors/ton-connect.error';
import { BridgeIncomingMessage } from 'src/provider/bridge/models/bridge-incomming-message';
import { HttpBridgeGatewayStorage } from 'src/storage/http-bridge-gateway-storage';
import { IStorage } from 'src/storage/models/storage.interface';
import { addPathToUrl } from 'src/utils/url';
import '@tonconnect/isomorphic-eventsource';
import '@tonconnect/isomorphic-fetch';

export class BridgeGateway {
    private readonly ssePath = 'events';

    private readonly postPath = 'message';

    private readonly heartbeatMessage = 'heartbeat';

    private readonly defaultTtl = 300;

    private eventSource: EventSource | undefined;

    private isClosed = false;

    private readonly bridgeGatewayStorage: HttpBridgeGatewayStorage;

    constructor(
        storage: IStorage,
        private readonly bridgeUrl: string,
        public readonly sessionId: string,
        private listener: (msg: BridgeIncomingMessage) => void,
        private errorsListener: (err: Event) => void
    ) {
        this.bridgeGatewayStorage = new HttpBridgeGatewayStorage(storage, bridgeUrl);
    }

    public async registerSession(options?: { openingDeadlineMS?: number }): Promise<void> {
        const url = new URL(addPathToUrl(this.bridgeUrl, this.ssePath));
        url.searchParams.append('client_id', this.sessionId);

        const lastEventId = await this.bridgeGatewayStorage.getLastEventId();

        if (this.isClosed) {
            return;
        }

        if (lastEventId) {
            url.searchParams.append('last_event_id', lastEventId);
        }

        this.eventSource = new EventSource(url.toString());

        return new Promise((resolve, reject) => {
            const timeout = options?.openingDeadlineMS ? setTimeout(() => {
                if (this.eventSource?.readyState !== EventSource.OPEN) {
                    reject(new TonConnectError('Bridge connection timeout'))
                    this.close();
                }
            }, options.openingDeadlineMS) : undefined;

            this.eventSource!.onerror = () => reject;
            this.eventSource!.onopen! = (): void => {
                clearTimeout(timeout);
                this.isClosed = false;
                this.eventSource!.onerror = this.errorsHandler.bind(this);
                this.eventSource!.onmessage = this.messagesHandler.bind(this);
                resolve();
            };
        });
    }

    public async send(
        message: Uint8Array,
        receiver: string,
        topic: RpcMethod,
        ttl?: number
    ): Promise<void> {
        const url = new URL(addPathToUrl(this.bridgeUrl, this.postPath));
        url.searchParams.append('client_id', this.sessionId);
        url.searchParams.append('to', receiver);
        url.searchParams.append('ttl', (ttl || this.defaultTtl).toString());
        url.searchParams.append('topic', topic);

        const response = await fetch(url, {
            method: 'post',
            body: Base64.encode(message)
        });

        if (!response.ok) {
            throw new TonConnectError(`Bridge send failed, status ${response.status}`);
        }
    }

    public pause(): void {
        this.eventSource?.close();
    }

    public unPause(): Promise<void> {
        return this.registerSession();
    }

    public close(): void {
        this.isClosed = true;
        this.eventSource?.close();
    }

    public setListener(listener: (msg: BridgeIncomingMessage) => void): void {
        this.listener = listener;
    }

    public setErrorsListener(errorsListener: (err: Event) => void): void {
        this.errorsListener = errorsListener;
    }

    private errorsHandler(e: Event): void {
        if (!this.isClosed) {
            if (this.eventSource?.readyState === EventSource.CLOSED) {
                this.eventSource.close();
                this.registerSession();
                return;
            }

            if (this.eventSource?.readyState === EventSource.CONNECTING) {
                console.debug('[TON_CONNET_SDK_ERROR]: Bridge error', JSON.stringify(e));
                return;
            }

            this.errorsListener(e);
        }
    }

    private async messagesHandler(e: MessageEvent<string>): Promise<void> {
        if (e.data === this.heartbeatMessage) {
            return;
        }

        await this.bridgeGatewayStorage.storeLastEventId(e.lastEventId);

        if (!this.isClosed) {
            let bridgeIncomingMessage: BridgeIncomingMessage;

            try {
                bridgeIncomingMessage = JSON.parse(e.data);
            } catch (e) {
                throw new TonConnectError(`Bridge message parse failed, message ${e.data}`);
            }

            this.listener(bridgeIncomingMessage);
        }
    }
}

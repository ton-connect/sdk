import { Base64 } from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors';
import { BridgeIncomingMessage } from 'src/provider/bridge/models/bridge-incomming-message';
import { HttpBridgeGatewayStorage } from 'src/storage/http-bridge-gateway-storage';
import { IStorage } from 'src/storage/models/storage.interface';
import { addPathToUrl } from 'src/utils/url';

export class BridgeGateway {
    private readonly ssePath = 'events';

    private readonly postPath = 'message';

    private readonly defaultTtl = 300;

    private eventSource: EventSource | undefined;

    private isClosed = false;

    private readonly bridgeGatewayStorage: HttpBridgeGatewayStorage;

    constructor(
        storage: IStorage,
        private readonly bridgeUrl: string,
        public readonly sessionId: string,
        private readonly listener: (msg: BridgeIncomingMessage) => void,
        private readonly errorsListener: (err: Event) => void
    ) {
        this.bridgeGatewayStorage = new HttpBridgeGatewayStorage(storage);
    }

    public async registerSession(): Promise<void> {
        const url = new URL(addPathToUrl(this.bridgeUrl, this.ssePath));
        url.searchParams.append('client_id', this.sessionId);

        const lastEventId = await this.bridgeGatewayStorage.getLastEventId();
        if (lastEventId) {
            url.searchParams.append('last_event_id', lastEventId);
        }

        this.eventSource = new EventSource(url);

        return new Promise((resolve, reject) => {
            this.eventSource!.onerror = reject;
            this.eventSource!.onopen! = (): void => {
                this.eventSource!.onerror = this.errorsHandler.bind(this);
                this.eventSource!.onmessage = this.messagesHandler.bind(this);
                resolve();
            };
        });
    }

    public async send(message: Uint8Array, receiver: string, ttl?: number): Promise<void> {
        const url = new URL(addPathToUrl(this.bridgeUrl, this.postPath));
        url.searchParams.append('client_id', this.sessionId);
        url.searchParams.append('to', receiver);
        url.searchParams.append('ttl', (ttl || this.defaultTtl).toString());
        await fetch(url, {
            method: 'post',
            body: Base64.encode(message)
        });
    }

    public close(): void {
        this.isClosed = true;
        this.eventSource?.close();
    }

    private errorsHandler(e: Event): void {
        if (!this.isClosed) {
            this.errorsListener(e);
        }
    }

    private async messagesHandler(e: MessageEvent<string>): Promise<void> {
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

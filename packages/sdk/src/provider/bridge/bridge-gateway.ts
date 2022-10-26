import { BridgeIncomingMessage } from 'src/provider/bridge/models/bridge-incomming-message';

export class BridgeGateway {
    private readonly ssePath = 'events';

    private readonly postPath = 'message';

    private readonly defaultTtl = 300;

    private eventSource: EventSource | undefined;

    private isClosed = false;

    private readonly bridgeUrl: string;

    constructor(
        bridgeUrl: string,
        public readonly sessionId: string,
        private readonly listener: (msg: BridgeIncomingMessage) => void,
        private readonly errorsListener: (err: Event) => void
    ) {
        if (bridgeUrl.slice(-1) === '/') {
            this.bridgeUrl = bridgeUrl.slice(0, -1);
        } else {
            this.bridgeUrl = bridgeUrl;
        }
    }

    public async registerSession(): Promise<void> {
        const url = new URL(`this.bridgeUrl/${this.ssePath}`);
        url.searchParams.append('client_id', this.sessionId);
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
        const url = new URL(`this.bridgeUrl/${this.postPath}`);
        url.searchParams.append('client_id', this.sessionId);
        url.searchParams.append('to', receiver);
        url.searchParams.append('ttl', (ttl || this.defaultTtl).toString());
        await fetch(url, {
            method: 'post',
            body: message
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

    private messagesHandler(e: MessageEvent<BridgeIncomingMessage>): void {
        if (!this.isClosed) {
            this.listener(e.data);
        }
    }
}

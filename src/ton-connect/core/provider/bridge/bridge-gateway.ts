import { BridgeError } from 'src/ton-connect/core/provider/bridge/models/bridge-error';
import { BridgeEvent } from 'src/ton-connect/core/provider/bridge/models/bridge-event';
import { BridgeMessage } from 'src/ton-connect/core/provider/bridge/models/bridge-message';

export class BridgeGateway {
    private eventSource: EventSource | undefined;

    constructor(
        private readonly bridgeUrl: string,
        public readonly sessionId: string,
        private readonly listener: (bridge: BridgeGateway, msg: BridgeMessage) => void
    ) {}

    public async registerSession(): Promise<void> {
        const url = new URL(this.bridgeUrl);
        url.searchParams.append('sessionId', this.sessionId);
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

    private errorsHandler(e: Event): void {
        const parsed = this.parseSSEError(e);
        this.listener(this, { error: parsed });
    }

    private messagesHandler(e: MessageEvent): void {
        const parsed = this.parseSSEEvent(e);
        this.listener(this, { event: parsed });
    }

    private parseSSEEvent(e: MessageEvent): BridgeEvent {
        return e as unknown as BridgeEvent;
    }

    private parseSSEError(e: Event): BridgeError {
        return e as unknown as BridgeError;
    }
}

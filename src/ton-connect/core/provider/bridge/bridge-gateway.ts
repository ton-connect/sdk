import { ProviderError } from 'src/ton-connect/core/provider/models/provider-error';
import { ProviderEvent } from 'src/ton-connect/core/provider/models/provider-event';

export class BridgeGateway {
    private eventSource: EventSource | undefined;

    constructor(
        private readonly bridgeUrl: string,
        public readonly sessionId: string,
        private readonly listener: (e: ProviderError | ProviderEvent) => void
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
        this.listener(parsed);
    }

    private messagesHandler(e: MessageEvent): void {
        const parsed = this.parseSSEEvent(e);
        this.listener(parsed);
    }

    private parseSSEEvent(e: MessageEvent): ProviderEvent {
        return e as unknown as ProviderEvent;
    }

    private parseSSEError(e: Event): ProviderError {
        return e as unknown as ProviderError;
    }
}

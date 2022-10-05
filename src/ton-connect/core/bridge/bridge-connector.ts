import { BridgeError } from 'src/ton-connect/core/bridge/models/bridge-error';
import { BridgeEvent } from 'src/ton-connect/core/bridge/models/bridge-event';

export class BridgeConnector {
    private eventsListeners: {
        listener: (event: BridgeEvent) => void;
        errorsHandler?: (error: BridgeError) => void;
    }[] = [];

    private eventSource: EventSource | undefined;

    constructor(private readonly bridgeUrl: string, public readonly sessionId: string) {}

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

    public listen(
        listener: (event: BridgeEvent) => void,
        errorsHandler?: (error: BridgeError) => void
    ): void {
        this.eventsListeners.push({ listener, errorsHandler });
    }

    private errorsHandler(e: Event): void {
        const parsed = this.parseSSEError(e);
        this.eventsListeners.forEach(item => item.errorsHandler?.(parsed));
    }

    private messagesHandler(e: MessageEvent): void {
        const parsed = this.parseSSEEvent(e);
        this.eventsListeners.forEach(item => item.listener(parsed));
    }

    private parseSSEEvent(e: MessageEvent): BridgeEvent {
        return e as unknown as BridgeEvent;
    }

    private parseSSEError(e: Event): BridgeError {
        return e as unknown as BridgeError;
    }
}

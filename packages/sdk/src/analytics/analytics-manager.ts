import { logDebug, logError } from '../utils/log';
import { AnalyticsEvent } from './types';
import { tonConnectSdkVersion } from 'src/constants/version';
import { UUIDv4, UUIDv7 } from 'src/utils/uuid';
import { Analytics } from 'src/analytics/analytics';
import { pascalToKebab } from 'src/analytics/utils';
import { IEnvironment } from 'src/environment/models/environment.interface';
import { isQaModeEnabled } from 'src/utils/qa-mode';
import { Dynamic } from 'src/utils/types';

export type EventsCollectorOptions = {
    batchTimeoutMs?: number;
    maxBatchSize?: number;
    analyticsUrl?: string;
    enabled?: boolean;
    environment?: IEnvironment;
};

export class AnalyticsManager {
    private events: AnalyticsEvent[] = [];
    private timeoutId: ReturnType<typeof setTimeout> | null = null;
    private isProcessing = false;

    private backoff = 1;
    private currentBatchTimeoutMs: number;

    private readonly batchTimeoutMs: number;
    private readonly maxBatchSize: number;
    private readonly analyticsUrl: string;
    private enabled: boolean;

    private readonly baseEvent: Partial<AnalyticsEvent>;

    private static readonly HTTP_STATUS = {
        TOO_MANY_REQUESTS: 429,
        CLIENT_ERROR_START: 400,
        SERVER_ERROR_START: 500
    } as const;

    private static readonly MAX_BACKOFF_ATTEMPTS = 5;
    private static readonly BACKOFF_MULTIPLIER = 2;

    constructor(options: EventsCollectorOptions = {}) {
        this.batchTimeoutMs = options.batchTimeoutMs ?? 2000;
        this.currentBatchTimeoutMs = this.batchTimeoutMs;
        this.maxBatchSize = options.maxBatchSize ?? 100;
        this.analyticsUrl = options.analyticsUrl ?? 'https://analytics.ton.org/events';
        this.enabled = options.enabled ?? true;

        this.baseEvent = {
            subsystem: 'dapp-sdk',
            version: tonConnectSdkVersion,
            client_environment: options.environment?.getClientEnvironment()
        };
    }

    scoped<
        TEvent extends AnalyticsEvent = AnalyticsEvent,
        TOptional extends keyof TEvent = 'event_name'
    >(sharedData?: Partial<Dynamic<AnalyticsEvent>>): Analytics<TEvent, TOptional> {
        return new Proxy(this, {
            get(target, prop) {
                const propName = prop.toString();
                if (propName.startsWith('emit')) {
                    const eventNamePascal = propName.replace('emit', '');
                    const eventNameKebab = pascalToKebab(eventNamePascal);
                    return function (event: Omit<AnalyticsEvent, 'event_name'>) {
                        const executedData = Object.fromEntries(
                            Object.entries(sharedData ?? {}).map(([key, value]) => [
                                key,
                                typeof value === 'function' ? value() : value
                            ])
                        );

                        return target.emit({
                            event_name: eventNameKebab,
                            ...executedData,
                            ...event
                        } as AnalyticsEvent);
                    };
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (target as any)[prop];
            }
        }) as unknown as Analytics<TEvent, TOptional>;
    }

    private emit(event: AnalyticsEvent): void {
        if (!this.enabled) {
            return;
        }

        const traceId = event.trace_id ?? UUIDv7();

        const enhancedEvent = {
            ...this.baseEvent,
            ...event,
            event_id: UUIDv4(),
            client_timestamp: Math.floor(Date.now() / 1000),
            trace_id: traceId
        } as const;

        if (isQaModeEnabled()) {
            logDebug(enhancedEvent);
        }
        this.events.push(enhancedEvent);

        if (this.events.length >= this.maxBatchSize) {
            void this.flush();
            return;
        }

        this.startTimeout();
    }

    private startTimeout(): void {
        if (this.timeoutId || this.isProcessing) {
            return;
        }

        this.timeoutId = setTimeout(() => {
            void this.flush();
        }, this.currentBatchTimeoutMs);
    }

    async flush(): Promise<void> {
        if (this.isProcessing || this.events.length === 0) {
            return;
        }

        this.clearTimeout();
        this.isProcessing = true;

        const eventsToSend = this.extractEventsToSend();

        try {
            await this.processEventsBatch(eventsToSend);
            logDebug('Analytics events sent successfully');
        } catch (error) {
            this.restoreEvents(eventsToSend);
            logError('Failed to send analytics events:', error);
        } finally {
            this.isProcessing = false;
            this.scheduleNextFlushIfNeeded();
        }
    }

    private clearTimeout(): void {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    private extractEventsToSend(): AnalyticsEvent[] {
        const eventsToSend = this.events.slice(0, this.maxBatchSize);
        this.events = this.events.slice(this.maxBatchSize);
        return eventsToSend;
    }

    private async processEventsBatch(eventsToSend: AnalyticsEvent[]): Promise<void> {
        logDebug('Sending analytics events...', eventsToSend.length);
        const response = await this.sendEvents(eventsToSend);
        this.handleResponse(response);
    }

    private handleResponse(response: Response): void {
        const { status, statusText } = response;

        if (this.isTooManyRequests(status)) {
            this.handleTooManyRequests(status, statusText);
        } else if (this.isClientError(status)) {
            this.handleClientError(status, statusText);
        } else if (this.isServerError(status)) {
            this.handleServerError(status, statusText);
        }
    }

    private restoreEvents(eventsToSend: AnalyticsEvent[]): void {
        this.events.unshift(...eventsToSend);
    }

    private scheduleNextFlushIfNeeded(): void {
        if (this.events.length > 0) {
            this.startTimeout();
        }
    }

    private async sendEvents(events: AnalyticsEvent[]): Promise<Response> {
        return await fetch(this.analyticsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Client-Timestamp': Math.floor(Date.now() / 1000).toString()
            },
            body: JSON.stringify(events)
        });
    }

    private isClientError(status: number): boolean {
        return (
            status >= AnalyticsManager.HTTP_STATUS.CLIENT_ERROR_START &&
            status < AnalyticsManager.HTTP_STATUS.SERVER_ERROR_START
        );
    }

    private isServerError(status: number): boolean {
        return status >= AnalyticsManager.HTTP_STATUS.SERVER_ERROR_START;
    }

    private isTooManyRequests(status: number): boolean {
        return status === AnalyticsManager.HTTP_STATUS.TOO_MANY_REQUESTS;
    }

    private handleClientError(status: number, statusText: string): void {
        // Don't retry
        logError(
            'Failed to send analytics events:',
            new Error(`Analytics API error: ${status} ${statusText}`)
        );
    }

    private handleServerError(status: number, statusText: string): void {
        if (this.backoff < AnalyticsManager.MAX_BACKOFF_ATTEMPTS) {
            this.backoff++;
            this.currentBatchTimeoutMs *= AnalyticsManager.BACKOFF_MULTIPLIER;
            throw new Error(`Analytics API error: ${status} ${statusText}`);
        } else {
            this.currentBatchTimeoutMs *= AnalyticsManager.BACKOFF_MULTIPLIER;
            return; // Don't retry
        }
    }

    private handleTooManyRequests(status: number, statusText: string): void {
        throw new Error(`Analytics API error: ${status} ${statusText}`);
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    getPendingEventsCount(): number {
        return this.events.length;
    }
}

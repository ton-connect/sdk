import { logDebug, logError } from '../utils/log';
import { AnalyticsEvent } from './types';
import { tonConnectSdkVersion } from 'src/constants/version';
import { v4, v7 } from 'src/utils/uuid';
import { Analytics } from 'src/analytics/analytics';
import { pascalToKebab } from 'src/analytics/utils';
import { IEnvironment } from 'src/environment/models/environment.interface';

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

    private readonly batchTimeoutMs: number;
    private readonly maxBatchSize: number;
    private readonly analyticsUrl: string;
    private enabled: boolean;

    private readonly baseEvent: Partial<AnalyticsEvent>;

    constructor(options: EventsCollectorOptions = {}) {
        this.batchTimeoutMs = options.batchTimeoutMs ?? 5000;
        this.maxBatchSize = options.maxBatchSize ?? 100;
        this.analyticsUrl = options.analyticsUrl ?? 'https://analytics.ton.org/swagger/index.html';
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
    >(sharedData?: Partial<AnalyticsEvent>): Analytics<TEvent, TOptional> {
        return new Proxy(this, {
            get(target, prop) {
                const propName = prop.toString();
                if (propName.startsWith('emit')) {
                    const eventNamePascal = propName.replace('emit', '');
                    const eventNameKebab = pascalToKebab(eventNamePascal);
                    return function (event: Omit<AnalyticsEvent, 'event_name'>) {
                        return target.emit({
                            event_name: eventNameKebab,
                            ...sharedData,
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

        const traceId = event.trace_id ?? v7();

        const enhancedEvent = {
            ...event,
            event_id: v4(),
            client_timestamp: Math.floor(Date.now() / 1000),
            trace_id: traceId
        } as const;

        console.log(enhancedEvent);
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
        }, this.batchTimeoutMs);
    }

    async flush(): Promise<void> {
        if (this.isProcessing || this.events.length === 0) {
            return;
        }

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }

        this.isProcessing = true;
        const eventsToSend = this.events.slice(0, this.maxBatchSize);
        this.events = this.events.slice(this.maxBatchSize);

        try {
            logDebug('Sending analytics events...', eventsToSend.length);
            // TODO
            // https://github.com/telegram-mini-apps-dev/analytics/blob/master/src/services/Batch.service.ts
            await this.sendEvents(eventsToSend);
            logDebug('Analytics events sent successfully');
        } catch (error) {
            this.events.unshift(...eventsToSend);
            logError('Failed to send analytics events:', error);
        } finally {
            this.isProcessing = false;

            if (this.events.length > 0) {
                this.startTimeout();
            }
        }
    }

    private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
        const url = `${this.analyticsUrl}/events`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Client-Timestamp': Math.floor(Date.now() / 1000).toString()
            },
            body: JSON.stringify(events)
        });

        if (!response.ok) {
            throw new Error(`Analytics API error: ${response.status} ${response.statusText}`);
        }
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

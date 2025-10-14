import { logDebug, logError } from '../utils/log';
import { AnalyticsEvent } from './types';
import { getTgUser, isInTMA } from 'src/utils/tma-api';
import { tonConnectSdkVersion } from 'src/constants/version';
import v7 from 'src/utils/uuid/v7';
import { Analytics } from 'src/analytics/analytics';
import { pascalToKebab } from 'src/analytics/utils';

export type EventsCollectorOptions = {
    batchTimeoutMs?: number;
    maxBatchSize?: number;
    analyticsUrl?: string;
    enabled?: boolean;
};

export class AnalyticsManager {
    private events: AnalyticsEvent[] = [];
    private timeoutId: ReturnType<typeof setTimeout> | null = null;
    private isProcessing = false;
    private readonly options: Required<EventsCollectorOptions>;

    constructor(options: EventsCollectorOptions = {}) {
        this.options = {
            batchTimeoutMs: 5000,
            maxBatchSize: 100,
            analyticsUrl: 'https://analytics.ton.org/swagger/index.html', // TODO: change to https://analytics.ton.org/events
            enabled: true,
            ...options
        };
    }

    scoped<
        TEvent extends AnalyticsEvent = AnalyticsEvent,
        TOptional extends keyof TEvent = 'event_name'
    >(
        scope?: 'tonconnect' | 'http-bridge' | 'js-bridge',
        sharedData?: Partial<AnalyticsEvent>
    ): Analytics<TEvent, TOptional> {
        let enhancedEvent = {
            ...sharedData
        };
        if (scope === 'tonconnect') {
            const tgUser = getTgUser();

            enhancedEvent = {
                locale: 'en', // TODO? how to get locale,
                tg_id: tgUser?.id,
                tma_is_premium: tgUser?.isPremium,
                browser: '', // TODO,
                ...sharedData
            };
        }

        return new Proxy(this, {
            get(target, prop) {
                const propName = prop.toString();
                if (propName.startsWith('emit')) {
                    const eventNamePascal = propName.replace('emit', '');
                    const eventNameKebab = pascalToKebab(eventNamePascal);
                    return function (event: Omit<AnalyticsEvent, 'event_name'>) {
                        return target.emit({
                            event_name: eventNameKebab,
                            ...enhancedEvent,
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
        if (!this.options.enabled) {
            return;
        }

        const enhancedEvent = {
            subsystem: 'dapp-sdk',
            version: tonConnectSdkVersion,
            client_environment: isInTMA() ? 'miniapp' : 'web',
            ...event,
            event_id: crypto.randomUUID(),
            client_timestamp: Math.floor(Date.now() / 1000),
            // TODO: trace id should be in protocol, for now generated here
            trace_id: v7()
        } as const;

        console.log(enhancedEvent);
        this.events.push(enhancedEvent);

        if (this.events.length >= this.options.maxBatchSize) {
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
        }, this.options.batchTimeoutMs);
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
        const eventsToSend = this.events.slice(0, this.options.maxBatchSize);
        this.events = this.events.slice(this.options.maxBatchSize);

        try {
            logDebug('Sending analytics events...', eventsToSend.length);
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
        const url = `${this.options.analyticsUrl}/events`;

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
        this.options.enabled = enabled;
    }

    isEnabled(): boolean {
        return this.options.enabled;
    }

    getPendingEventsCount(): number {
        return this.events.length;
    }
}

import { AnalyticsEvent } from 'src/analytics/types';
import { Analytics } from 'src/analytics/analytics';

export class ScopedAnalyticsManager implements Analytics {
    constructor(
        private readonly analytics: Analytics,
        private readonly sharedEventData: Partial<AnalyticsEvent>
    ) {}

    emit(event: AnalyticsEvent): void {
        return this.analytics.emit({
            ...this.sharedEventData,
            ...event
        });
    }
}

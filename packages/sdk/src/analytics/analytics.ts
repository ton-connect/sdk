import { AnalyticsEvent } from 'src/analytics/types';

export interface Analytics {
    emit(event: Partial<AnalyticsEvent>): void;
}

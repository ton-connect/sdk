import { AnalyticsEvent } from 'src/analytics/types';

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

type KebabToCamel<T extends string> = T extends `${infer H}-${infer J}${infer K}`
    ? `${Uncapitalize<H>}${Capitalize<J>}${KebabToCamel<K>}`
    : T;

type KebabToPascal<T extends string> = Capitalize<KebabToCamel<T>>;

export type Analytics<
    TEvent extends AnalyticsEvent = AnalyticsEvent,
    TOptional extends keyof TEvent = 'event_name'
> = {
    [E in TEvent as `emit${KebabToPascal<E['event_name']>}`]: (
        event: Omit<Optional<E, TOptional>, 'event_name'>
    ) => void;
};

export type AsStruct<T> = { [P in keyof T as T[P] extends Function ? never : P]: T[P] };

export type WithoutId<T extends { id: unknown }> = Omit<T, 'id'>;
export type WithoutIdDistributive<T extends { id: unknown }> = DistributiveOmit<T, 'id'>;

export type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export function hasProperty<T extends string>(
    value: unknown,
    propertyKey: T
): value is Record<T, unknown> {
    return hasProperties(value, [propertyKey]);
}

export function hasProperties<T extends string>(
    value: unknown,
    propertyKeys: T[]
): value is Record<T, unknown> {
    if (!value || typeof value !== 'object') {
        return false;
    }

    return propertyKeys.every(propertyKey => propertyKey in value);
}

export type Dynamic<TObject extends Record<string, unknown>> = {
    [Key in keyof TObject]: TObject[Key] | (() => TObject[Key]);
};

/**
 * Wraps a value with a required `traceId` — a UUID
 * used to correlate logs and analytics across the dApp, bridge and wallet for
 * one user-visible operation.
 *
 * @see [`trace_id` (Bridge spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/bridge.md#trace_id--analytics-correlation)
 */
export type Traceable<T extends {} = {}> = { traceId: string } & T;

/**
 * Wraps a value with an optional `traceId`.
 */
export type OptionalTraceable<T extends {} = {}> = { traceId?: string } & T;

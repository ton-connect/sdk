export type AsStruct<T> = { [P in keyof T as T[P] extends Function ? never : P]: T[P] };

export type WithoutIdDistributive<T extends { id: unknown }> = DistributiveOmit<T, 'id'>;
export type WithoutId<T extends { id: unknown }> = Omit<T, 'id'>;

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

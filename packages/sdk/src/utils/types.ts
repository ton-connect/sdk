export type AsStruct<T> = { [P in keyof T as T[P] extends Function ? never : P]: T[P] };

export type WithoutId<T extends { id: unknown }> = Omit<T, 'id'>;
export type WithoutIdDistributive<T extends { id: unknown }> = DistributiveOmit<T, 'id'>;

export type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

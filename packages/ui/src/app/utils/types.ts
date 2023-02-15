export type PropertyRequired<Type, Key extends keyof Type> = Type & {
    [Property in Key]-?: Type[Property];
};

export type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T | undefined;

export function notLikeNull<T>(item: T | undefined | null): item is T {
    return item != null;
}

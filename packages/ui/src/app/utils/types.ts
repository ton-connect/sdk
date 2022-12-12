export type PropertyRequired<Type, Key extends keyof Type> = Type & {
    [Property in Key]-?: Type[Property];
};

export type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T | undefined;

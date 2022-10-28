import deepmerge from 'deepmerge';

export function mergeOptions<T>(options: Partial<T> | undefined | null, defaultOptions: T): T {
    if (!options) {
        return defaultOptions;
    }

    const overwriteMerge = (_: unknown[], sourceArray: unknown[], __: unknown): unknown[] =>
        sourceArray;

    return deepmerge(defaultOptions, options, { arrayMerge: overwriteMerge });
}

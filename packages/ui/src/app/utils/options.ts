import deepmerge from 'deepmerge';
import { DeepPartial } from 'src/app/utils/types';
import { isPlainObject } from 'is-plain-object';

export function mergeOptions<T>(options: DeepPartial<T> | undefined | null, defaultOptions: T): T {
    if (!options) {
        return defaultOptions;
    }

    const overwriteMerge = (_: unknown[], sourceArray: unknown[], __: unknown): unknown[] =>
        sourceArray;

    return deepmerge(defaultOptions, options, {
        arrayMerge: overwriteMerge,
        isMergeableObject: isPlainObject
    });
}

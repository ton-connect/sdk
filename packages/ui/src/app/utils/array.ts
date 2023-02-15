export function uniq<T>(array: T[]): T[] {
    return [...new Set(array)];
}

export function mergeConcat<K extends PropertyKey, T extends Record<K, unknown>>(
    idKey: K,
    array1: T[],
    array2: T[]
): T[] {
    return array1
        .map(item1 => {
            const item2 = array2.find(elem => elem[idKey] === item1[idKey]);
            array2 = array2.filter(elem => elem[idKey] !== item1[idKey]);

            return item2 === undefined ? item1 : item2;
        })
        .concat(array2);
}

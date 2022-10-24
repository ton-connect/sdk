import { TonConnectError } from 'src/errors/ton-connect.error';

export function concatUint8Arrays(buffer1: Uint8Array, buffer2: Uint8Array): Uint8Array {
    const mergedArray = new Uint8Array(buffer1.length + buffer2.length);
    mergedArray.set(buffer1);
    mergedArray.set(buffer2, buffer1.length);
    return mergedArray;
}

export function splitToUint8Arrays(array: Uint8Array, index: number): [Uint8Array, Uint8Array] {
    if (index >= array.length) {
        throw new TonConnectError('Index is out of buffer');
    }

    const subArray1 = array.slice(0, index);
    const subArray2 = array.slice(index);
    return [subArray1, subArray2];
}

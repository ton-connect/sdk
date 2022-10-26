export function concatUint8Arrays(buffer1: Uint8Array, buffer2: Uint8Array): Uint8Array {
    const mergedArray = new Uint8Array(buffer1.length + buffer2.length);
    mergedArray.set(buffer1);
    mergedArray.set(buffer2, buffer1.length);
    return mergedArray;
}

export function splitToUint8Arrays(array: Uint8Array, index: number): [Uint8Array, Uint8Array] {
    if (index >= array.length) {
        throw new Error('Index is out of buffer');
    }

    const subArray1 = array.slice(0, index);
    const subArray2 = array.slice(index);
    return [subArray1, subArray2];
}

export function toHexString(byteArray: Uint8Array): string {
    let hexString = '';
    byteArray.forEach(byte => {
        hexString += ('0' + (byte & 0xff).toString(16)).slice(-2);
    });
    return hexString;
}
export function hexToByteArray(hexString: string): Uint8Array {
    if (hexString.length % 2 !== 0) {
        throw new Error(`Cannot convert ${hexString} to bytesArray`);
    }
    const result = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        result[i / 2] = parseInt(hexString.slice(i, i + 2), 16);
    }
    return result;
}

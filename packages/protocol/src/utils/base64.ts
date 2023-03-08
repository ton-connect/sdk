import nacl from 'tweetnacl-util';

function encodeUint8Array(value: Uint8Array, urlSafe: boolean): string {
    const encoded = nacl.encodeBase64(value);
    if (!urlSafe) {
        return encoded;
    }

    return encodeURIComponent(encoded);
}

function decodeToUint8Array(value: string, urlSafe: boolean): Uint8Array {
    if (urlSafe) {
        value = decodeURIComponent(value);
    }

    return nacl.decodeBase64(value);
}

function encode(value: string | object | Uint8Array, urlSafe = false): string {
    let uint8Array: Uint8Array;

    if (value instanceof Uint8Array) {
        uint8Array = value;
    } else {
        if (typeof value !== 'string') {
            value = JSON.stringify(value);
        }

        uint8Array = nacl.decodeUTF8(value);
    }

    return encodeUint8Array(uint8Array, urlSafe);
}

function decode(
    value: string,
    urlSafe = false
): {
    toString(): string;
    toObject<T>(): T | null;
    toUint8Array(): Uint8Array;
} {
    const decodedUint8Array = decodeToUint8Array(value, urlSafe);

    return {
        toString(): string {
            return nacl.encodeUTF8(decodedUint8Array);
        },
        toObject<T>(): T | null {
            try {
                return JSON.parse(nacl.encodeUTF8(decodedUint8Array)) as T;
            } catch (e) {
                return null;
            }
        },
        toUint8Array(): Uint8Array {
            return decodedUint8Array;
        }
    };
}

export const Base64 = {
    encode,
    decode
};

export type { encode, decode };

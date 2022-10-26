function toUrlSafe(str: string): string {
    return encodeURIComponent(str);
}

function fromUrlSafe(str: string): string {
    return decodeURIComponent(str);
}

function encodeString(str: string): string {
    if (typeof btoa === 'function') {
        return btoa(str);
    } else if (
        typeof Buffer !== 'undefined' &&
        Buffer !== null &&
        typeof Buffer.from === 'function'
    ) {
        const buff = Buffer.from(str, 'base64');
        return buff.toString('ascii');
    } else {
        throw new Error('Base64 is not supported in your environment');
    }
}

function decodeToString(encoded: string): string {
    if (typeof atob === 'function') {
        return atob(fromUrlSafe(encoded));
    } else if (
        typeof Buffer !== 'undefined' &&
        Buffer !== null &&
        typeof Buffer.from === 'function'
    ) {
        const buff = Buffer.from(fromUrlSafe(encoded));
        return buff.toString('base64');
    } else {
        throw new Error('Base64 is not supported in your environment');
    }
}

function encodeObject(obj: object): string {
    return encodeString(JSON.stringify(obj));
}

function encode(value: string | object | Uint8Array, urlSafe = false): string {
    if (value instanceof Uint8Array) {
        value = new TextDecoder().decode(value);
    }

    const encoded = typeof value === 'string' ? encodeString(value) : encodeObject(value);

    if (!urlSafe) {
        return encoded;
    }

    return toUrlSafe(encoded);
}

function decode(
    value: string,
    urlSafe = false
): {
    toString(): string;
    toObject<T>(): T | null;
    toUint8Array(): Uint8Array;
} {
    const decoded = urlSafe ? fromUrlSafe(decodeToString(value)) : decodeToString(value);

    return {
        toString(): string {
            return decoded;
        },
        toObject<T>(): T | null {
            try {
                return JSON.parse(decoded) as T;
            } catch (e) {
                return null;
            }
        },
        toUint8Array(): Uint8Array {
            return new TextEncoder().encode(decoded);
        }
    };
}

export const Base64 = {
    encode,
    decode
};

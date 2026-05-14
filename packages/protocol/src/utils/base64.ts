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

/**
 * Base64 codec used across the protocol — small wrapper around `tweetnacl-util`
 * that adds object/JSON support and an optional `urlSafe` mode for values
 * embedded in URLs.
 *
 * `decode` returns a lazy view: call `.toString()`, `.toObject<T>()`, or
 * `.toUint8Array()` to materialise the decoded bytes once.
 */
export const Base64 = {
    /**
     * Encode a string, object (JSON-stringified), or raw bytes as Base64.
     *
     * @param value source value — `Uint8Array`, `string`, or any JSON-serialisable object.
     * @param urlSafe percent-encode the output for safe inclusion in URLs.
     */
    encode,
    /**
     * Decode a Base64 string into a lazy accessor. Call `.toString()` for the
     * UTF-8 text, `.toObject<T>()` to `JSON.parse` it (returns `null` on
     * invalid JSON), or `.toUint8Array()` for the raw bytes.
     *
     * @param value Base64 input (possibly percent-encoded if `urlSafe`).
     * @param urlSafe inverse of the `urlSafe` flag used to encode the value.
     */
    decode
};

export type { encode, decode };

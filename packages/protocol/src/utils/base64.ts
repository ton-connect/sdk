import { Buffer } from 'buffer';

function encodeBuffer(buffer: Buffer, urlSafe: boolean): string {
    return buffer.toString(urlSafe ? 'base64url' : 'base64');
}

function decodeToBuffer(message: string, urlSafe: boolean): Buffer {
    return Buffer.from(message, urlSafe ? 'base64url' : 'base64');
}

function encode(value: string | object | Uint8Array, urlSafe = true): string {
    if (!(value instanceof Uint8Array) && !(typeof value === 'string')) {
        value = JSON.stringify(value);
    }

    const buffer = Buffer.from(value);

    return encodeBuffer(buffer, urlSafe);
}

function decode(
    value: string,
    urlSafe = true
): {
    toString(): string;
    toObject<T>(): T | null;
    toUint8Array(): Uint8Array;
} {
    const decodedBuffer = decodeToBuffer(value, urlSafe);

    return {
        toString(): string {
            return decodedBuffer.toString('utf-8');
        },
        toObject<T>(): T | null {
            try {
                return JSON.parse(decodedBuffer.toString('utf-8')) as T;
            } catch (e) {
                return null;
            }
        },
        toUint8Array(): Uint8Array {
            return new Uint8Array(
                decodedBuffer.buffer,
                decodedBuffer.byteOffset,
                decodedBuffer.byteLength / Uint8Array.BYTES_PER_ELEMENT
            );
        }
    };
}

export const Base64 = {
    encode,
    decode
};

declare function encode(value: string | object | Uint8Array, urlSafe?: boolean): string;
declare function decode(value: string, urlSafe?: boolean): {
    toString(): string;
    toObject<T>(): T | null;
    toUint8Array(): Uint8Array;
};
export declare const Base64: {
    encode: typeof encode;
    decode: typeof decode;
};
export type { encode, decode };

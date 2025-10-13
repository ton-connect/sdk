export type UUIDTypes<TBuf extends Uint8Array = Uint8Array> = string | TBuf;

export type Version7Options = {
    random?: Uint8Array;
    msecs?: number;
    seq?: number;
    rng?: () => Uint8Array;
};

export type AppWireRequest = AppWireSendTransaction | AppWireSignMessage | AppWireSignData;

export interface AppWireSendTransaction {
    /** from address */
    f?: string;
    /** network (chain id) */
    n?: string;
    /** valid_until */
    vu?: number;
    /** method: sendTransaction */
    m: 'st';
    /** messages */
    ms?: WireMessage[];
    /** structured items */
    i?: WireItem[];
}

export interface AppWireSignMessage {
    /** from address */
    f?: string;
    /** network (chain id) */
    n?: string;
    /** valid_until */
    vu?: number;
    /** method: signMessage */
    m: 'sm';
    /** messages */
    ms?: WireMessage[];
    /** structured items */
    i?: WireItem[];
}

// ── SignData payload ───────────────────────────────────────────────

export type AppWireSignData = {
    /** method: signData */
    m: 'sd';
    /** network */
    n?: string;
    /** from */
    f?: string;
} & (WireSignDataText | WireSignDataBinary | WireSignDataCell);

export interface WireSignDataText {
    /** type */
    t: 'text';
    /** text */
    tx: string;
}

export interface WireSignDataBinary {
    /** type */
    t: 'binary';
    /** bytes */
    b: string;
}

export interface WireSignDataCell {
    /** type */
    t: 'cell';
    /** schema */
    s: string;
    /** cell */
    c: string;
}

// ── Legacy message (BoC-based) ─────────────────────────────────────

export interface WireMessage {
    /** address */
    a: string;
    /** amount */
    am: string;
    /** payload (BoC) */
    p?: string;
    /** stateInit (BoC) */
    si?: string;
    /** extra_currency */
    ec?: { [k: number]: string };
}

// ── Structured items ───────────────────────────────────────────────

export type WireItem = WireTonItem | WireJettonItem | WireNftItem;

export interface WireTonItem {
    /** type */
    t: 'ton';
    /** address */
    a: string;
    /** amount */
    am: string;
    /** payload (BoC) */
    p?: string;
    /** state_init (BoC) */
    si?: string;
    /** extra_currency */
    ec?: { [k: number]: string };
}

export interface WireJettonItem {
    /** type */
    t: 'jetton';
    /** master */
    ma: string;
    /** destination */
    d: string;
    /** amount */
    am: string;
    /** attach_amount */
    aa?: string;
    /** response_destination */
    rd?: string;
    /** custom_payload */
    cp?: string;
    /** forward_amount */
    fa?: string;
    /** forward_payload */
    fp?: string;
    /** query_id */
    qi?: string;
}

export interface WireNftItem {
    /** type */
    t: 'nft';
    /** nft_address */
    na: string;
    /** new_owner */
    no: string;
    /** attach_amount */
    aa?: string;
    /** response_destination */
    rd?: string;
    /** custom_payload */
    cp?: string;
    /** forward_amount */
    fa?: string;
    /** forward_payload */
    fp?: string;
    /** query_id */
    qi?: string;
}

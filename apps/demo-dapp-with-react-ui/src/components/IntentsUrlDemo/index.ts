export type ConnectRequest = {
    manifestUrl: string;
    items: ConnectItem[];
};

export type ConnectItem = TonAddressItem | TonProofItem;

export type TonAddressItem = {
    name: 'ton_addr';
};

export type TonProofItem = {
    name: 'ton_proof';
    payload: string;
};

export type IntentItem = SendTonItem | SendJettonItem | SendNftItem;

export interface SendTonItem {
    t: 'ton';
    a: string; // address - message destination in user-friendly format
    am: string; // amount - number of nanocoins to send as a decimal string
    p?: string; // payload - raw one-cell BoC encoded in Base64
    si?: string; // state_init - raw one-cell BoC encoded in Base64
    ec?: Record<string, string>; // extra_currency - extra currencies to send with the message
}

export interface SendJettonItem {
    t: 'jetton';
    ma: string; // master_address - jetton master contract address
    qi?: number; // query_id - arbitrary request number
    ja: string; // jetton_amount - amount of transferring jettons in elementary units
    d: string; // destination - address of the new owner of the jettons
    rd?: string; // response_destination - address where to send a response
    cp?: string; // custom_payload - raw one-cell BoC encoded in Base64
    fta?: string; // forward_ton_amount - amount of nanotons to be sent to the destination address
    fp?: string; // forward_payload - Base64-encoded custom data
}

export interface SendNftItem {
    t: 'nft';
    na: string; // nft_address - address of the NFT item to transfer
    qi?: number; // query_id - arbitrary request number
    no: string; // new_owner - address of the new owner of the NFT item
    rd?: string; // response_destination - address where to send a response
    cp?: string; // custom_payload - raw one-cell BoC encoded in Base64
    fta?: string; // forward_ton_amount - amount of nanotons to be sent to the destination address
    fp?: string; // forward_payload - Base64-encoded custom data
}

// Sign Data Payload Types
export type SignDataPayload = TextSignDataPayload | BinarySignDataPayload | CellSignDataPayload;

export interface TextSignDataPayload {
    type: 'text';
    text: string;
}

export interface BinarySignDataPayload {
    type: 'binary';
    bytes: string; // base64 (not url safe) encoded arbitrary bytes array
}

export interface CellSignDataPayload {
    type: 'cell';
    schema: string; // TL-B schema of the cell payload
    cell: string; // base64 (not url safe) encoded BoC
}

// Intent Request Types
export interface MakeSendTransactionIntentRequest {
    id: string;
    m: 'txIntent';
    c?: ConnectRequest; // connect_request - optional
    vu?: number; // valid_until - unix timestamp
    n?: string; // network - target network
    i: IntentItem[]; // items - ordered list of intent fragments
}

export interface MakeSignDataIntentRequest {
    id: string;
    m: 'signIntent';
    c?: ConnectRequest; // connect_request - optional
    n?: string; // network - target network
    mu?: string; // manifestUrl - tonconnect-manifest URL
    p: SignDataPayload; // payload - sign data payload
}

export interface MakeSendActionIntentRequest {
    id: string;
    m: 'actionIntent';
    c?: ConnectRequest; // connect_request - optional
    a: string; // action_url - action URL that wallet will call
}

export type IntentRequest =
    | MakeSendTransactionIntentRequest
    | MakeSignDataIntentRequest
    | MakeSendActionIntentRequest;

/**
 * Converts a base64 string to base64url format
 * Base64URL uses - and _ instead of + and /, and removes padding
 */
function toBase64Url(base64: string): string {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Encodes a string to base64url format (browser-compatible)
 */
function base64UrlEncode(str: string): string {
    // Use btoa for base64 encoding in browser
    const base64 = btoa(unescape(encodeURIComponent(str)));
    return toBase64Url(base64);
}

export function urlSafeJsonStringify(obj: unknown): string {
    return base64UrlEncode(JSON.stringify(obj));
}

export function urlSafeJsonStringifyBase64Url(obj: unknown): string {
    return base64UrlEncode(JSON.stringify(obj));
}

export function urlSafeJsonStringifyEncodeURI(obj: unknown): string {
    return encodeURIComponent(JSON.stringify(obj));
}

export function generateIntentUrlWithStorage(
    clientPubKey: string,
    walletPk: string,
    getUrl: string
): string {
    const params = new URLSearchParams({
        id: clientPubKey,
        pk: walletPk,
        get_url: getUrl
    });
    return `tc://intent?${params.toString()}`;
}

export function generateIntentUrlInline(clientPubKey: string, intent: IntentRequest): string {
    const data = urlSafeJsonStringify(intent);
    const params = new URLSearchParams({
        id: clientPubKey,
        r: data
    });
    return `tc://intent_inline?${params.toString()}`;
}

export function generateIntentUrlInlineWithEncoding(
    clientPubKey: string,
    intent: IntentRequest,
    encoding: 'base64url' | 'encodeURI'
): string {
    const data =
        encoding === 'base64url'
            ? urlSafeJsonStringifyBase64Url(intent)
            : urlSafeJsonStringifyEncodeURI(intent);
    const params = new URLSearchParams({
        id: clientPubKey,
        r: data
    });
    return `tc://intent_inline?${params.toString()}`;
}

export function createTransactionIntent(
    id: string,
    items: IntentItem[],
    options?: {
        connectRequest?: ConnectRequest;
        validUntil?: number;
        network?: string;
    }
): MakeSendTransactionIntentRequest {
    return {
        id,
        m: 'txIntent',
        ...(options?.connectRequest && { c: options.connectRequest }),
        ...(options?.validUntil && { vu: options.validUntil }),
        ...(options?.network && { n: options.network }),
        i: items
    };
}

export function createSignDataIntent(
    id: string,
    payload: SignDataPayload,
    options?: {
        manifestUrl?: string;
        connectRequest?: ConnectRequest;
        network?: string;
    }
): MakeSignDataIntentRequest {
    return {
        id,
        m: 'signIntent',
        ...(options?.connectRequest && { c: options.connectRequest }),
        ...(options?.network && { n: options.network }),
        ...(options?.manifestUrl && { mu: options.manifestUrl }),
        p: payload
    };
}

export function createActionIntent(
    id: string,
    actionUrl: string,
    options?: {
        connectRequest?: ConnectRequest;
    }
): MakeSendActionIntentRequest {
    return {
        id,
        m: 'actionIntent',
        ...(options?.connectRequest && { c: options.connectRequest }),
        a: actionUrl
    };
}

export function createTonTransferItem(
    address: string,
    amount: string,
    options?: {
        payload?: string;
        stateInit?: string;
        extraCurrency?: Record<string, string>;
    }
): SendTonItem {
    return {
        t: 'ton',
        a: address,
        am: amount,
        ...(options?.payload && { p: options.payload }),
        ...(options?.stateInit && { si: options.stateInit }),
        ...(options?.extraCurrency && { ec: options.extraCurrency })
    };
}

export function createJettonTransferItem(
    masterAddress: string,
    jettonAmount: string,
    destination: string,
    options?: {
        queryId?: number;
        responseDestination?: string;
        customPayload?: string;
        forwardTonAmount?: string;
        forwardPayload?: string;
    }
): SendJettonItem {
    return {
        t: 'jetton',
        ma: masterAddress,
        ja: jettonAmount,
        d: destination,
        ...(options?.queryId !== undefined && { qi: options.queryId }),
        ...(options?.responseDestination && { rd: options.responseDestination }),
        ...(options?.customPayload && { cp: options.customPayload }),
        ...(options?.forwardTonAmount && { fta: options.forwardTonAmount }),
        ...(options?.forwardPayload && { fp: options.forwardPayload })
    };
}

export function createNftTransferItem(
    nftAddress: string,
    newOwner: string,
    options?: {
        queryId?: number;
        responseDestination?: string;
        customPayload?: string;
        forwardTonAmount?: string;
        forwardPayload?: string;
    }
): SendNftItem {
    return {
        t: 'nft',
        na: nftAddress,
        no: newOwner,
        ...(options?.queryId !== undefined && { qi: options.queryId }),
        ...(options?.responseDestination && { rd: options.responseDestination }),
        ...(options?.customPayload && { cp: options.customPayload }),
        ...(options?.forwardTonAmount && { fta: options.forwardTonAmount }),
        ...(options?.forwardPayload && { fp: options.forwardPayload })
    };
}

export function createTextSignDataPayload(text: string): TextSignDataPayload {
    return {
        type: 'text',
        text
    };
}

export function createBinarySignDataPayload(bytes: string): BinarySignDataPayload {
    return {
        type: 'binary',
        bytes
    };
}

export function createCellSignDataPayload(schema: string, cell: string): CellSignDataPayload {
    return {
        type: 'cell',
        schema,
        cell
    };
}

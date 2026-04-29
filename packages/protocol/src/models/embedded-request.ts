import { Base64 } from '../utils/base64';
import { ChainId } from './CHAIN';
import { AppRequest } from './app-message';
import { RpcJettonItem, RpcNftItem, RpcStructuredItem, RpcTonItem } from './structured-item';

// ────────────────────────────────────────────────────────────────────────────
//  Wire types — compact, URL-encoded shape of an RPC request embedded in the
//  connect URL as the `e` query parameter. Every field is abbreviated to
//  minimise URL length; the protocol `decodeEmbeddedRequestParam` / `decodeWireEmbeddedRequest`
//  helpers convert these back to the standard JSON-RPC `AppRequest` shape.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Top-level wire shape of an embedded app-request. Discriminated on `m` (method).
 * One of:
 *  - {@link WireSendTransaction} (`m: 'st'`)
 *  - {@link WireSignMessage}     (`m: 'sm'`)
 *  - {@link WireSignData}        (`m: 'sd'`)
 */
export type WireEmbeddedRequest = WireSendTransaction | WireSignMessage | WireSignData;

/**
 * Compact wire form of `AppRequest<'sendTransaction'>`.
 * The payload carries EITHER `ms` (raw messages) OR `i` (structured items),
 * never both.
 */
export interface WireSendTransaction {
    /** method discriminator: `sendTransaction` */
    m: 'st';
    /** from — sender address (optional; defaults to connected account) */
    f?: string;
    /** network — TON chain id (e.g. `"-239"` for mainnet) */
    n?: string;
    /** valid_until — unix epoch seconds */
    vu?: number;
    /** raw messages (mutually exclusive with `i`) */
    ms?: WireMessage[];
    /** structured items (mutually exclusive with `ms`) */
    i?: WireItem[];
}

/**
 * Compact wire form of `AppRequest<'signMessage'>`.
 * Same shape as {@link WireSendTransaction}; only the method discriminator differs.
 */
export interface WireSignMessage {
    /** method discriminator: `signMessage` */
    m: 'sm';
    /** from — sender address */
    f?: string;
    /** network — TON chain id */
    n?: string;
    /** valid_until — unix epoch seconds */
    vu?: number;
    /** raw messages (mutually exclusive with `i`) */
    ms?: WireMessage[];
    /** structured items (mutually exclusive with `ms`) */
    i?: WireItem[];
}

/**
 * Compact wire form of `AppRequest<'signData'>`.
 * Discriminated on `t` (payload type): `text` | `binary` | `cell`.
 */
export type WireSignData = {
    /** method discriminator: `signData` */
    m: 'sd';
    /** network — TON chain id */
    n?: string;
    /** from — sender address */
    f?: string;
} & (WireSignDataText | WireSignDataBinary | WireSignDataCell);

/** Sign-data payload: plain UTF-8 text. */
export interface WireSignDataText {
    /** payload type discriminator */
    t: 'text';
    /** text to sign */
    tx: string;
}

/** Sign-data payload: arbitrary binary blob, base64-encoded. */
export interface WireSignDataBinary {
    /** payload type discriminator */
    t: 'binary';
    /** base64-encoded bytes */
    b: string;
}

/** Sign-data payload: a TVM cell with a TL-B schema. */
export interface WireSignDataCell {
    /** payload type discriminator */
    t: 'cell';
    /** TL-B schema describing the cell layout */
    s: string;
    /** base64-encoded cell BoC */
    c: string;
}

/**
 * Wire form of a raw transaction message (non-structured — the caller is
 * responsible for the BoC). Counterpart of the standard `SendTransaction`
 * `messages[]` element.
 */
export interface WireMessage {
    /** destination address */
    a: string;
    /** amount in nanocoins (decimal string) */
    am: string;
    /** optional one-cell BoC body, base64 */
    p?: string;
    /** optional state init, base64 */
    si?: string;
    /** extra currencies map */
    ec?: { [k: number]: string };
}

/**
 * Wire form of a single structured item. Discriminated on `t`.
 * Counterpart of the user-facing `StructuredItem` (SDK).
 */
export type WireItem = WireTonItem | WireJettonItem | WireNftItem;

/** Structured item: native TON transfer. */
export interface WireTonItem {
    /** item type discriminator */
    t: 'ton';
    /** destination address */
    a: string;
    /** amount in nanocoins (decimal string) */
    am: string;
    /** optional one-cell BoC body, base64 */
    p?: string;
    /** optional state init, base64 */
    si?: string;
    /** extra currencies map */
    ec?: { [k: number]: string };
}

/** Structured item: jetton (TEP-74) transfer. */
export interface WireJettonItem {
    /** item type discriminator */
    t: 'jetton';
    /** jetton master contract address */
    ma: string;
    /** jetton recipient address */
    d: string;
    /** jetton amount in elementary units */
    am: string;
    /** TON to attach for fees (wallet estimates if omitted) */
    aa?: string;
    /** where to send excess TON (defaults to sender) */
    rd?: string;
    /** optional custom_payload cell BoC, base64 */
    cp?: string;
    /** forward_ton_amount in nanocoins */
    fa?: string;
    /** optional forward_payload cell BoC, base64 */
    fp?: string;
    /** optional query_id */
    qi?: string;
}

/** Structured item: NFT (TEP-62) transfer. */
export interface WireNftItem {
    /** item type discriminator */
    t: 'nft';
    /** NFT item contract address */
    na: string;
    /** new owner address */
    no: string;
    /** TON to attach for fees */
    aa?: string;
    /** where to send excess TON (defaults to sender) */
    rd?: string;
    /** optional custom_payload cell BoC, base64 */
    cp?: string;
    /** forward_ton_amount in nanocoins */
    fa?: string;
    /** optional forward_payload cell BoC, base64 */
    fp?: string;
    /** optional query_id */
    qi?: string;
}

// ────────────────────────────────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────────────────────────────────

function fromBase64Url(base64url: string): string {
    const padded = base64url.length + ((4 - (base64url.length % 4)) % 4);
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(padded, '=');
    return Base64.decode(base64).toString();
}

interface ExpandedMessage {
    address: string;
    amount: string;
    stateInit?: string;
    payload?: string;
    extra_currency?: { [k: number]: string };
}

function expandMessage(w: WireMessage): ExpandedMessage {
    const msg: ExpandedMessage = { address: w.a, amount: w.am };
    if (w.p !== undefined) {
        msg.payload = w.p;
    }
    if (w.si !== undefined) {
        msg.stateInit = w.si;
    }
    if (w.ec !== undefined) {
        msg.extra_currency = w.ec;
    }
    return msg;
}

function expandItem(w: WireItem): RpcStructuredItem {
    switch (w.t) {
        case 'ton': {
            const item: RpcTonItem = { type: 'ton', address: w.a, amount: w.am };
            if (w.p !== undefined) {
                item.payload = w.p;
            }
            if (w.si !== undefined) {
                item.stateInit = w.si;
            }
            if (w.ec !== undefined) {
                item.extra_currency = w.ec;
            }
            return item;
        }
        case 'jetton': {
            const item: RpcJettonItem = {
                type: 'jetton',
                master: w.ma,
                destination: w.d,
                amount: w.am
            };
            if (w.aa !== undefined) {
                item.attachAmount = w.aa;
            }
            if (w.rd !== undefined) {
                item.responseDestination = w.rd;
            }
            if (w.cp !== undefined) {
                item.customPayload = w.cp;
            }
            if (w.fa !== undefined) {
                item.forwardAmount = w.fa;
            }
            if (w.fp !== undefined) {
                item.forwardPayload = w.fp;
            }
            if (w.qi !== undefined) {
                item.queryId = w.qi;
            }
            return item;
        }
        case 'nft': {
            const item: RpcNftItem = {
                type: 'nft',
                nftAddress: w.na,
                newOwner: w.no
            };
            if (w.aa !== undefined) {
                item.attachAmount = w.aa;
            }
            if (w.rd !== undefined) {
                item.responseDestination = w.rd;
            }
            if (w.cp !== undefined) {
                item.customPayload = w.cp;
            }
            if (w.fa !== undefined) {
                item.forwardAmount = w.fa;
            }
            if (w.fp !== undefined) {
                item.forwardPayload = w.fp;
            }
            if (w.qi !== undefined) {
                item.queryId = w.qi;
            }
            return item;
        }
    }
}

function expandTransactionBody(
    wire: WireSendTransaction | WireSignMessage
): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    if (wire.vu !== undefined) {
        payload.valid_until = wire.vu;
    }
    if (wire.n !== undefined) {
        payload.network = wire.n as ChainId;
    }
    if (wire.f !== undefined) {
        payload.from = wire.f;
    }
    if (wire.ms) {
        payload.messages = wire.ms.map(expandMessage);
    }
    if (wire.i) {
        payload.items = wire.i.map(expandItem);
    }
    return payload;
}

function expandSignDataBody(wire: WireSignData): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    if (wire.n !== undefined) {
        payload.network = wire.n as ChainId;
    }
    if (wire.f !== undefined) {
        payload.from = wire.f;
    }

    switch (wire.t) {
        case 'text':
            payload.type = 'text';
            payload.text = wire.tx;
            break;
        case 'binary':
            payload.type = 'binary';
            payload.bytes = wire.b;
            break;
        case 'cell':
            payload.type = 'cell';
            payload.schema = wire.s;
            payload.cell = wire.c;
            break;
    }
    return payload;
}

/**
 * Decode a compact {@link WireEmbeddedRequest} back to the standard JSON-RPC
 * `AppRequest`-shaped `{ method, params: [JSON-string] }`.
 */
export function decodeWireEmbeddedRequest(
    wire: WireEmbeddedRequest
): Omit<AppRequest<'sendTransaction' | 'signMessage' | 'signData'>, 'id'> {
    switch (wire.m) {
        case 'st':
            return {
                method: 'sendTransaction',
                params: [JSON.stringify(expandTransactionBody(wire))]
            };
        case 'sm':
            return {
                method: 'signMessage',
                params: [JSON.stringify(expandTransactionBody(wire))]
            };
        case 'sd':
            return {
                method: 'signData',
                params: [JSON.stringify(expandSignDataBody(wire))]
            };
    }
}

/**
 * Decode the `e` URL parameter and return `{ method, params: [string] }` —
 * the same shape as a bridge `AppRequest` (without `id`).
 *
 * The `e` value is `base64url(JSON.stringify(WireEmbeddedRequest))`.
 */
export function decodeEmbeddedRequestParam(
    reqParam: string
): Omit<AppRequest<'sendTransaction' | 'signMessage' | 'signData'>, 'id'> {
    const json = fromBase64Url(reqParam);
    const wire: WireEmbeddedRequest = JSON.parse(json);
    return decodeWireEmbeddedRequest(wire);
}

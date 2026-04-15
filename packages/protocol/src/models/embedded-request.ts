import { Base64 } from '../utils/base64';
import { ChainId } from './CHAIN';
import { AppRequest } from './app-message';

// ── Wire types (compact URL‑encoded format) ─────────────────────────

export type EmbeddedWireRequest =
    | EmbeddedWireSendTransaction
    | EmbeddedWireSignMessage
    | EmbeddedWireSignData;

export interface EmbeddedWireSendTransaction {
    m: 'st';
    f?: string;
    n?: string;
    vu?: number;
    ms?: WireMessage[];
    i?: WireItem[];
}

export interface EmbeddedWireSignMessage {
    m: 'sm';
    f?: string;
    n?: string;
    vu?: number;
    ms?: WireMessage[];
    i?: WireItem[];
}

export type EmbeddedWireSignData = {
    m: 'sd';
    n?: string;
    f?: string;
} & (WireSignDataText | WireSignDataBinary | WireSignDataCell);

export interface WireSignDataText {
    t: 'text';
    tx: string;
}

export interface WireSignDataBinary {
    t: 'binary';
    b: string;
}

export interface WireSignDataCell {
    t: 'cell';
    s: string;
    c: string;
}

export interface WireMessage {
    a: string;
    am: string;
    p?: string;
    si?: string;
    ec?: { [k: number]: string };
}

export type WireItem = WireTonItem | WireJettonItem | WireNftItem;

export interface WireTonItem {
    t: 'ton';
    a: string;
    am: string;
    p?: string;
    si?: string;
    ec?: { [k: number]: string };
}

export interface WireJettonItem {
    t: 'jetton';
    ma: string;
    d: string;
    am: string;
    aa?: string;
    rd?: string;
    cp?: string;
    fa?: string;
    fp?: string;
    qi?: string;
}

export interface WireNftItem {
    t: 'nft';
    na: string;
    no: string;
    aa?: string;
    rd?: string;
    cp?: string;
    fa?: string;
    fp?: string;
    qi?: string;
}

// ── Parsed output ────────────────────────────────────────────────────
// Same shape as AppRequest but without `id` (embedded requests have no id).

export type ParsedEmbeddedRequest = Omit<
    AppRequest<'sendTransaction' | 'signMessage' | 'signData'>,
    'id'
>;

// ── Helpers ──────────────────────────────────────────────────────────

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

type ExpandedItem = ExpandedTonItem | ExpandedJettonItem | ExpandedNftItem;

interface ExpandedTonItem {
    type: 'ton';
    address: string;
    amount: string;
    payload?: string;
    state_init?: string;
    extra_currency?: { [k: number]: string };
}

interface ExpandedJettonItem {
    type: 'jetton';
    master: string;
    destination: string;
    amount: string;
    attach_amount?: string;
    response_destination?: string;
    custom_payload?: string;
    forward_amount?: string;
    forward_payload?: string;
    query_id?: string;
}

interface ExpandedNftItem {
    type: 'nft';
    nft_address: string;
    new_owner: string;
    attach_amount?: string;
    response_destination?: string;
    custom_payload?: string;
    forward_amount?: string;
    forward_payload?: string;
    query_id?: string;
}

function expandItem(w: WireItem): ExpandedItem {
    switch (w.t) {
        case 'ton': {
            const item: ExpandedTonItem = { type: 'ton', address: w.a, amount: w.am };
            if (w.p !== undefined) {
                item.payload = w.p;
            }
            if (w.si !== undefined) {
                item.state_init = w.si;
            }
            if (w.ec !== undefined) {
                item.extra_currency = w.ec;
            }
            return item;
        }
        case 'jetton': {
            const item: ExpandedJettonItem = {
                type: 'jetton',
                master: w.ma,
                destination: w.d,
                amount: w.am
            };
            if (w.aa !== undefined) {
                item.attach_amount = w.aa;
            }
            if (w.rd !== undefined) {
                item.response_destination = w.rd;
            }
            if (w.cp !== undefined) {
                item.custom_payload = w.cp;
            }
            if (w.fa !== undefined) {
                item.forward_amount = w.fa;
            }
            if (w.fp !== undefined) {
                item.forward_payload = w.fp;
            }
            if (w.qi !== undefined) {
                item.query_id = w.qi;
            }
            return item;
        }
        case 'nft': {
            const item: ExpandedNftItem = {
                type: 'nft',
                nft_address: w.na,
                new_owner: w.no
            };
            if (w.aa !== undefined) {
                item.attach_amount = w.aa;
            }
            if (w.rd !== undefined) {
                item.response_destination = w.rd;
            }
            if (w.cp !== undefined) {
                item.custom_payload = w.cp;
            }
            if (w.fa !== undefined) {
                item.forward_amount = w.fa;
            }
            if (w.fp !== undefined) {
                item.forward_payload = w.fp;
            }
            if (w.qi !== undefined) {
                item.query_id = w.qi;
            }
            return item;
        }
    }
}

function expandTransactionBody(
    wire: EmbeddedWireSendTransaction | EmbeddedWireSignMessage
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

function expandSignDataBody(wire: EmbeddedWireSignData): Record<string, unknown> {
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

export function expandEmbeddedWireRequest(wire: EmbeddedWireRequest): ParsedEmbeddedRequest {
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
 * Decode a `req` URL parameter and return `{ method, params: [string] }` —
 * the same shape as a bridge `AppRequest` (without `id`).
 *
 * The `req` value is `base64url(JSON.stringify(EmbeddedWireRequest))`.
 */
export function parseEmbeddedRequest(reqParam: string): ParsedEmbeddedRequest {
    const json = fromBase64Url(reqParam);
    const wire: EmbeddedWireRequest = JSON.parse(json);
    return expandEmbeddedWireRequest(wire);
}

import { ChainId, ConnectRequest, SignDataPayload } from '@tonconnect/protocol';
import {
    SendTransactionIntentRequest,
    SendTransactionIntentItem,
    SendTransactionIntentItemJetton,
    SendTransactionIntentItemNft,
    SendTransactionIntentItemTon,
    SignDataIntentRequest,
    SignMessageIntentRequest,
    SendActionIntentRequest
} from 'src/models/methods/intents';

type HexChainId = string;

interface BaseIntentPayload {
    // Optional client/App id. Can be omitted according to the latest spec updates.
    id?: string;
    // m: method
    m: 'txIntent' | 'signIntent' | 'signMsg' | 'actionIntent';
    // optional embedded connect request
    c?: ConnectRequest;
}

interface MakeSendTransactionIntentRequest extends BaseIntentPayload {
    m: 'txIntent';
    vu?: number;
    n?: HexChainId;
    i: IntentItem[];
}

interface MakeSignDataIntentRequest extends BaseIntentPayload {
    m: 'signIntent';
    n?: HexChainId;
    mu: string;
    p: SignDataPayload;
}

interface MakeSignMessageIntentRequest extends BaseIntentPayload {
    m: 'signMsg';
    vu?: number;
    n?: HexChainId;
    i: IntentItem[];
}

interface MakeSendActionIntentRequest extends BaseIntentPayload {
    m: 'actionIntent';
    a: string;
}

type IntentItem = SendTonItem | SendJettonItem | SendNftItem;

interface SendTonItem {
    t: 'ton';
    a: string;
    am: string;
    p?: string;
    si?: string;
    ec?: Record<string, string>;
}

interface SendJettonItem {
    t: 'jetton';
    ma: string;
    qi?: number;
    ja: string;
    d: string;
    am?: string;
    rd?: string;
    cp?: string;
    fta?: string;
    fp?: string;
}

interface SendNftItem {
    t: 'nft';
    na: string;
    qi?: number;
    no: string;
    am?: string;
    rd?: string;
    cp?: string;
    fta?: string;
    fp?: string;
}

interface CommonSerializeParams {
    id?: string;
    connectRequest?: ConnectRequest;
}

function toHexChainId(chainId: ChainId | undefined): HexChainId | undefined {
    return chainId !== undefined ? chainId.toString() : undefined;
}

function mapTonItem(item: SendTransactionIntentItemTon): SendTonItem {
    return {
        t: 'ton',
        a: item.address,
        am: item.amount,
        p: item.payload,
        si: item.stateInit,
        ec: item.extraCurrency
    };
}

function mapJettonItem(item: SendTransactionIntentItemJetton): SendJettonItem {
    return {
        t: 'jetton',
        ma: item.jettonMasterAddress,
        ja: item.jettonAmount,
        d: item.destination,
        am: item.attachedTon,
        rd: item.responseDestination,
        cp: item.customPayload,
        fta: item.forwardTonAmount,
        fp: item.forwardPayload,
        qi: item.queryId
    };
}

function mapNftItem(item: SendTransactionIntentItemNft): SendNftItem {
    return {
        t: 'nft',
        na: item.nftAddress,
        no: item.newOwnerAddress,
        am: item.attachedTon,
        rd: item.responseDestination,
        cp: item.customPayload,
        fta: item.forwardTonAmount,
        fp: item.forwardPayload,
        qi: item.queryId
    };
}

function mapIntentItem(item: SendTransactionIntentItem): IntentItem {
    switch (item.type) {
        case 'ton':
            return mapTonItem(item);
        case 'jetton':
            return mapJettonItem(item);
        case 'nft':
            return mapNftItem(item);
    }
}

export function serializeSendTransactionIntent(
    tx: SendTransactionIntentRequest,
    params: CommonSerializeParams
): MakeSendTransactionIntentRequest {
    return {
        id: params.id,
        m: 'txIntent',
        c: params.connectRequest,
        vu: tx.validUntil,
        n: toHexChainId(tx.network),
        i: tx.items.map(mapIntentItem)
    };
}

export function serializeSignDataIntent(
    req: SignDataIntentRequest,
    params: CommonSerializeParams & { manifestUrl: string }
): MakeSignDataIntentRequest {
    return {
        id: params.id,
        m: 'signIntent',
        c: params.connectRequest,
        n: toHexChainId(req.network),
        mu: params.manifestUrl,
        p: req.payload
    };
}

export function serializeSignMessageIntent(
    req: SignMessageIntentRequest,
    params: CommonSerializeParams
): MakeSignMessageIntentRequest {
    return {
        id: params.id,
        m: 'signMsg',
        c: params.connectRequest,
        vu: req.validUntil,
        n: toHexChainId(req.network),
        i: req.items.map(mapIntentItem)
    };
}

export function serializeSendActionIntent(
    req: SendActionIntentRequest,
    params: CommonSerializeParams
): MakeSendActionIntentRequest {
    return {
        id: params.id,
        m: 'actionIntent',
        c: params.connectRequest,
        a: req.actionUrl
    };
}

function toBase64Url(input: string): string {
    if (typeof Buffer !== 'undefined') {
        return Buffer.from(input, 'utf8')
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/g, '');
    }

    const b64 = btoa(unescape(encodeURIComponent(input)));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function encodeConnectRequestForUrl(connectRequest: ConnectRequest): string {
    return toBase64Url(JSON.stringify(connectRequest));
}

export function buildInlineIntentUrl(intentPayload: BaseIntentPayload): string {
    const r = toBase64Url(JSON.stringify(intentPayload));
    const search = new URLSearchParams();

    if (intentPayload.id) {
        search.set('id', intentPayload.id);
    }
    search.set('r', r);
    if (intentPayload.c !== undefined) {
        search.set('c', encodeConnectRequestForUrl(intentPayload.c));
    }

    return `tc://intent_inline?${search.toString()}`;
}

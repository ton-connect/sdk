import {
    ConnectRequest,
    IntentItem,
    RawSendActionIntentRequest,
    RawSendTransactionIntentRequest,
    RawSignDataIntentRequest,
    RawSignMessageIntentRequest,
    SendJettonItem,
    SendNftItem,
    SendTonItem
} from '@tonconnect/protocol';
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

interface CommonSerializeParams {
    id: string;
    connectRequest?: ConnectRequest;
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
): RawSendTransactionIntentRequest {
    return {
        id: params.id,
        m: 'txIntent',
        c: params.connectRequest,
        vu: tx.validUntil,
        f: tx.from,
        n: tx.network,
        i: tx.items.map(mapIntentItem)
    };
}

export function serializeSignDataIntent(
    req: SignDataIntentRequest,
    params: CommonSerializeParams & { manifestUrl?: string }
): RawSignDataIntentRequest {
    return {
        id: params.id,
        m: 'signIntent',
        c: params.connectRequest,
        n: req.network,
        f: req.from,
        mu: params.manifestUrl,
        p: req.payload
    };
}

export function serializeSignMessageIntent(
    req: SignMessageIntentRequest,
    params: CommonSerializeParams
): RawSignMessageIntentRequest {
    return {
        id: params.id,
        m: 'signMsg',
        c: params.connectRequest,
        vu: req.validUntil,
        n: req.network,
        i: req.items.map(mapIntentItem)
    };
}

export function serializeSendActionIntent(
    req: SendActionIntentRequest,
    params: CommonSerializeParams
): RawSendActionIntentRequest {
    return {
        id: params.id,
        m: 'actionIntent',
        c: params.connectRequest,
        a: req.actionUrl
    };
}

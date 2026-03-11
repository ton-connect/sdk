import {
    ConnectRequest,
    DraftItem,
    RawActionDraftRequest,
    RawSendTransactionDraftRequest,
    RawSignDataDraftPayload,
    RawSignMessageDraftRequest,
    SendJettonItem,
    SendNftItem,
    SendTonItem
} from '@tonconnect/protocol';
import {
    SendTransactionDraftRequest,
    SendTransactionDraftItem,
    SendTransactionDraftItemJetton,
    SendTransactionDraftItemNft,
    SendTransactionDraftItemTon,
    SignDataDraftRequest,
    SignMessageDraftRequest,
    SendActionDraftRequest,
    TypedDraftRequest
} from 'src/models/methods/drafts';
import { WithoutId } from 'src/utils/types';

interface CommonSerializeParams {
    connectRequest?: ConnectRequest;
}

function mapTonItem(item: SendTransactionDraftItemTon): SendTonItem {
    return {
        t: 'ton',
        a: item.address,
        am: item.amount,
        p: item.payload,
        si: item.stateInit,
        ec: item.extraCurrency
    };
}

function mapJettonItem(item: SendTransactionDraftItemJetton): SendJettonItem {
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

function mapNftItem(item: SendTransactionDraftItemNft): SendNftItem {
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

function mapDraftItem(item: SendTransactionDraftItem): DraftItem {
    switch (item.type) {
        case 'ton':
            return mapTonItem(item);
        case 'jetton':
            return mapJettonItem(item);
        case 'nft':
            return mapNftItem(item);
    }
}

export function serializeSendTransactionDraft(
    tx: SendTransactionDraftRequest,
    params: CommonSerializeParams
): WithoutId<RawSendTransactionDraftRequest> {
    return {
        m: 'txDraft',
        c: params.connectRequest,
        vu: tx.validUntil,
        f: tx.from,
        n: tx.network,
        i: tx.items.map(mapDraftItem)
    };
}

export function serializeSignDataDraft(
    req: SignDataDraftRequest,
    params: CommonSerializeParams
): Omit<RawSignDataDraftPayload, 'id'> {
    const payload: Record<string, unknown> = { ...req.payload };
    if (req.network) {
        payload.network = req.network;
    }
    if (req.from) {
        payload.from = req.from;
    }

    return {
        method: 'signData',
        params: [JSON.stringify(payload)],
        c: params.connectRequest
    };
}

export function serializeSignMessageDraft(
    req: SignMessageDraftRequest,
    params: CommonSerializeParams
): WithoutId<RawSignMessageDraftRequest> {
    return {
        m: 'signMsgDraft',
        c: params.connectRequest,
        vu: req.validUntil,
        n: req.network,
        i: req.items.map(mapDraftItem)
    };
}

export function serializeActionDraft(
    req: SendActionDraftRequest,
    params: CommonSerializeParams
): WithoutId<RawActionDraftRequest> {
    return {
        m: 'actionDraft',
        c: params.connectRequest,
        a: req.actionUrl
    };
}

export function serializeDraft(req: TypedDraftRequest, params: CommonSerializeParams = {}) {
    switch (req.method) {
        case 'sendTransaction':
            return serializeSendTransactionDraft(req, params);
        case 'signData':
            return serializeSignDataDraft(req, params);
        case 'signMessage':
            return serializeSignMessageDraft(req, params);
        case 'sendAction':
            return serializeActionDraft(req, params);
    }
}

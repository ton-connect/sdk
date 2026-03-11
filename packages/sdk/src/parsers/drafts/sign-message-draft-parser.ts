import {
    DraftItem,
    RawSignMessageDraftRequest,
    SendJettonItem,
    SendNftItem,
    SendTonItem,
    SIGN_MESSAGE_ERROR_CODES
} from '@tonconnect/protocol';
import { BadRequestError, TonConnectError, UnknownAppError, UserRejectsError } from 'src/errors';
import { UnknownError } from 'src/errors/unknown.error';
import { SignMessageResponse } from 'src/models/methods';
import {
    SendTransactionDraftItem,
    SendTransactionDraftItemJetton,
    SendTransactionDraftItemNft,
    SendTransactionDraftItemTon,
    SignMessageDraftRequest
} from 'src/models/methods/drafts';
import { WithoutId } from 'src/utils/types';
import { DraftParser, DraftSerializeParams } from './draft-parser';

const errorMap: Partial<Record<number, typeof TonConnectError>> = {
    [SIGN_MESSAGE_ERROR_CODES.UNKNOWN_ERROR]: UnknownError,
    [SIGN_MESSAGE_ERROR_CODES.USER_REJECTS_ERROR]: UserRejectsError,
    [SIGN_MESSAGE_ERROR_CODES.BAD_REQUEST_ERROR]: BadRequestError,
    [SIGN_MESSAGE_ERROR_CODES.UNKNOWN_APP_ERROR]: UnknownAppError
};

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

class SignMessageDraftParser extends DraftParser<'signMessage'> {
    serialize(
        request: SignMessageDraftRequest,
        params: DraftSerializeParams
    ): WithoutId<RawSignMessageDraftRequest> {
        return {
            m: 'signMsgDraft',
            c: params.connectRequest,
            vu: request.validUntil,
            n: request.network,
            i: request.items.map(mapDraftItem)
        };
    }

    convertFromResponse(response: unknown): SignMessageResponse {
        const typed = response as { result: { internal_boc: string } };
        return { internalBoc: typed.result.internal_boc };
    }

    parseAndThrowError(response: { error: { code: number; message: string } }): never {
        this.throwMappedError(errorMap, response);
    }
}

export const signMessageDraftParser = new SignMessageDraftParser();

import {
    SendJettonItem,
    SendNftItem,
    SendTonItem,
    TransactionDraftItem,
    SEND_TRANSACTION_ERROR_CODES
} from '@tonconnect/protocol';
import { BadRequestError, TonConnectError, UnknownAppError, UserRejectsError } from 'src/errors';
import { UnknownError } from 'src/errors/unknown.error';
import { SendTransactionResponse } from 'src/models/methods';
import {
    SendTransactionDraftItem,
    SendTransactionDraftItemJetton,
    SendTransactionDraftItemNft,
    SendTransactionDraftItemTon,
    SendTransactionDraftRequest
} from 'src/models/methods/send-transaction-draft';
import type { AppRequest } from '@tonconnect/protocol';
import { RpcParser } from 'src/parsers/rpc-parser';
import { WithoutId } from 'src/utils/types';

const errorMap: Partial<Record<number, typeof TonConnectError>> = {
    [SEND_TRANSACTION_ERROR_CODES.UNKNOWN_ERROR]: UnknownError,
    [SEND_TRANSACTION_ERROR_CODES.USER_REJECTS_ERROR]: UserRejectsError,
    [SEND_TRANSACTION_ERROR_CODES.BAD_REQUEST_ERROR]: BadRequestError,
    [SEND_TRANSACTION_ERROR_CODES.UNKNOWN_APP_ERROR]: UnknownAppError
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

export function mapTransactionDraftItem(item: SendTransactionDraftItem): TransactionDraftItem {
    switch (item.type) {
        case 'ton':
            return mapTonItem(item);
        case 'jetton':
            return mapJettonItem(item);
        case 'nft':
            return mapNftItem(item);
    }
}

class SendTransactionDraftParser extends RpcParser<'sendTransactionDraft'> {
    convertToRpcRequest(
        request: SendTransactionDraftRequest
    ): WithoutId<AppRequest<'sendTransactionDraft'>> {
        return {
            method: 'txDraft',
            params: {
                vu: request.validUntil,
                f: request.from,
                n: request.network,
                i: request.items.map(mapTransactionDraftItem)
            }
        } as unknown as WithoutId<AppRequest<'sendTransactionDraft'>>;
    }

    convertFromRpcResponse(response: unknown): SendTransactionResponse {
        const typed = response as { result: string };
        return { boc: typed.result };
    }

    parseAndThrowError(response: { error: { code: number; message: string } }): never {
        const ErrorConstructor = errorMap[response.error.code] ?? UnknownError;
        throw new ErrorConstructor(response.error.message);
    }
}

export const sendTransactionDraftParser = new SendTransactionDraftParser();

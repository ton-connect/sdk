import {
    SendJettonItem,
    SendNftItem,
    SendTonItem,
    TransactionDraftItem,
    SEND_TRANSACTION_ERROR_CODES,
    WalletResponseSuccess,
    WalletResponseError
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
import { isValidRawAddress, toUserFriendlyAddress } from 'src/utils/address';

const errorMap: Partial<Record<number, typeof TonConnectError>> = {
    [SEND_TRANSACTION_ERROR_CODES.UNKNOWN_ERROR]: UnknownError,
    [SEND_TRANSACTION_ERROR_CODES.USER_REJECTS_ERROR]: UserRejectsError,
    [SEND_TRANSACTION_ERROR_CODES.BAD_REQUEST_ERROR]: BadRequestError,
    [SEND_TRANSACTION_ERROR_CODES.UNKNOWN_APP_ERROR]: UnknownAppError
};

function normalizeAddress(address: string, network?: string): string {
    if (isValidRawAddress(address)) {
        return toUserFriendlyAddress(address, network === '-239');
    }
    return address;
}

function mapTonItem(item: SendTransactionDraftItemTon, network?: string): SendTonItem {
    return {
        t: 'ton',
        a: normalizeAddress(item.address, network),
        am: item.amount,
        p: item.payload,
        si: item.stateInit,
        ec: item.extraCurrency
    };
}

function mapJettonItem(item: SendTransactionDraftItemJetton, network?: string): SendJettonItem {
    return {
        t: 'jetton',
        ma: normalizeAddress(item.jettonMasterAddress, network),
        ja: item.jettonAmount,
        d: normalizeAddress(item.destination, network),
        am: item.attachedTon,
        rd: item.responseDestination
            ? normalizeAddress(item.responseDestination, network)
            : undefined,
        cp: item.customPayload,
        fta: item.forwardTonAmount,
        fp: item.forwardPayload,
        qi: item.queryId
    };
}

function mapNftItem(item: SendTransactionDraftItemNft, network?: string): SendNftItem {
    return {
        t: 'nft',
        na: normalizeAddress(item.nftAddress, network),
        no: normalizeAddress(item.newOwnerAddress, network),
        am: item.attachedTon,
        rd: item.responseDestination
            ? normalizeAddress(item.responseDestination, network)
            : undefined,
        cp: item.customPayload,
        fta: item.forwardTonAmount,
        fp: item.forwardPayload,
        qi: item.queryId
    };
}

export function mapTransactionDraftItem(
    item: SendTransactionDraftItem,
    network?: string
): TransactionDraftItem {
    switch (item.type) {
        case 'ton':
            return mapTonItem(item, network);
        case 'jetton':
            return mapJettonItem(item, network);
        case 'nft':
            return mapNftItem(item, network);
    }
}

class SendTransactionDraftParser extends RpcParser<'txDraft'> {
    convertToRpcRequest(request: SendTransactionDraftRequest): WithoutId<AppRequest<'txDraft'>> {
        return {
            method: 'txDraft',
            params: {
                vu: request.validUntil,
                f: request.from,
                n: request.network,
                i: request.items.map(item => mapTransactionDraftItem(item, request.network))
            }
        } as WithoutId<AppRequest<'txDraft'>>;
    }

    convertFromRpcResponse(
        response: WithoutId<WalletResponseSuccess<'txDraft'>>
    ): SendTransactionResponse {
        return { boc: response.result };
    }

    parseAndThrowError(response: WithoutId<WalletResponseError<'txDraft'>>): never {
        const ErrorConstructor = errorMap[response.error.code] ?? UnknownError;
        throw new ErrorConstructor(response.error.message);
    }
}

export const sendTransactionDraftParser = new SendTransactionDraftParser();

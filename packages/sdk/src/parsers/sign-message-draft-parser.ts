import {
    AppRequest,
    SIGN_MESSAGE_ERROR_CODES,
    WalletResponseError,
    WalletResponseSuccess
} from '@tonconnect/protocol';
import { BadRequestError, TonConnectError, UnknownAppError, UserRejectsError } from 'src/errors';
import { UnknownError } from 'src/errors/unknown.error';
import { SignMessageResponse } from 'src/models/methods';
import { SignMessageDraftRequest } from 'src/models/methods/sign-message-draft';
import { mapTransactionDraftItem } from 'src/parsers/send-transaction-draft-parser';
import { RpcParser } from 'src/parsers/rpc-parser';
import { WithoutId } from 'src/utils/types';

const errorMap: Partial<Record<number, typeof TonConnectError>> = {
    [SIGN_MESSAGE_ERROR_CODES.UNKNOWN_ERROR]: UnknownError,
    [SIGN_MESSAGE_ERROR_CODES.USER_REJECTS_ERROR]: UserRejectsError,
    [SIGN_MESSAGE_ERROR_CODES.BAD_REQUEST_ERROR]: BadRequestError,
    [SIGN_MESSAGE_ERROR_CODES.UNKNOWN_APP_ERROR]: UnknownAppError
};

class SignMessageDraftParser extends RpcParser<'signMsgDraft'> {
    convertToRpcRequest(request: SignMessageDraftRequest): WithoutId<AppRequest<'signMsgDraft'>> {
        return {
            method: 'signMsgDraft',
            params: {
                vu: request.validUntil,
                f: request.from,
                n: request.network,
                i: request.items.map(item => mapTransactionDraftItem(item, request.network))
            }
        } as WithoutId<AppRequest<'signMsgDraft'>>;
    }

    convertFromRpcResponse(
        response: WithoutId<WalletResponseSuccess<'signMsgDraft'>>
    ): SignMessageResponse {
        return { internalBoc: response.result.internal_boc };
    }

    parseAndThrowError(response: WithoutId<WalletResponseError<'signMsgDraft'>>): never {
        const ErrorConstructor = errorMap[response.error.code] ?? UnknownError;
        throw new ErrorConstructor(response.error.message);
    }
}

export const signMessageDraftParser = new SignMessageDraftParser();

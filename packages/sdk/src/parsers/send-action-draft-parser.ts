import {
    AppRequest,
    SEND_ACTION_DRAFT_ERROR_CODES,
    SendActionDraftResponseSuccess,
    WalletResponseError
} from '@tonconnect/protocol';
import { BadRequestError, TonConnectError, UnknownAppError, UserRejectsError } from 'src/errors';
import { UnknownError } from 'src/errors/unknown.error';
import { SendTransactionResponse, SignDataResponse, SignMessageResponse } from 'src/models/methods';
import { SendActionDraftRequest } from 'src/models/methods/send-action-draft';
import { WithoutId } from 'src/utils/types';
import { RpcParser } from 'src/parsers/rpc-parser';
import { arbitraryResponseParser } from 'src/parsers/arbitrary-response.parser';

export type SendActionDraftResponse =
    | SendTransactionResponse
    | SignDataResponse
    | SignMessageResponse;

const errorMap: Partial<Record<number, typeof TonConnectError>> = {
    [SEND_ACTION_DRAFT_ERROR_CODES.UNKNOWN_ERROR]: UnknownError,
    [SEND_ACTION_DRAFT_ERROR_CODES.USER_REJECTS_ERROR]: UserRejectsError,
    [SEND_ACTION_DRAFT_ERROR_CODES.BAD_REQUEST_ERROR]: BadRequestError,
    [SEND_ACTION_DRAFT_ERROR_CODES.UNKNOWN_APP_ERROR]: UnknownAppError
};

class SendActionDraftParser extends RpcParser<'actionDraft'> {
    convertFromRpcResponse(
        rpcResponse: WithoutId<SendActionDraftResponseSuccess>
    ): SendActionDraftResponse {
        return arbitraryResponseParser.convertFromRpcResponse(rpcResponse);
    }

    convertToRpcRequest(request: SendActionDraftRequest): WithoutId<AppRequest<'actionDraft'>> {
        return {
            method: 'actionDraft',
            params: {
                url: request.actionUrl
            }
        };
    }

    parseAndThrowError(response: WithoutId<WalletResponseError<'actionDraft'>>): never {
        const ErrorConstructor = errorMap[response.error.code] ?? UnknownError;
        throw new ErrorConstructor(response.error.message);
    }
}

export const sendActionDraftParser = new SendActionDraftParser();

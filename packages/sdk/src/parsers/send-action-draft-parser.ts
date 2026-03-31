import { AppRequest, SEND_ACTION_DRAFT_ERROR_CODES } from '@tonconnect/protocol';
import { BadRequestError, TonConnectError, UnknownAppError, UserRejectsError } from 'src/errors';
import { UnknownError } from 'src/errors/unknown.error';
import { SendTransactionResponse, SignDataResponse, SignMessageResponse } from 'src/models/methods';
import { SendActionDraftRequest } from 'src/models/methods/send-action-draft';
import { RpcParser } from 'src/parsers/rpc-parser';
import { WithoutId } from 'src/utils/types';

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
    convertToRpcRequest(request: SendActionDraftRequest): WithoutId<AppRequest<'actionDraft'>> {
        return {
            method: 'actionDraft',
            params: {
                url: request.actionUrl
            }
        };
    }

    convertFromRpcResponse(response: unknown): SendActionDraftResponse {
        return (response as { result: SendActionDraftResponse }).result;
    }

    parseAndThrowError(response: { error: { code: number; message: string } }): never {
        const ErrorConstructor = errorMap[response.error.code] ?? UnknownError;
        throw new ErrorConstructor(response.error.message);
    }
}

export const sendActionDraftParser = new SendActionDraftParser();

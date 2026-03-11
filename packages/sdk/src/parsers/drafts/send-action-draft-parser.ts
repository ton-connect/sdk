import { RawActionDraftRequest, SEND_TRANSACTION_ERROR_CODES } from '@tonconnect/protocol';
import { BadRequestError, TonConnectError, UnknownAppError, UserRejectsError } from 'src/errors';
import { UnknownError } from 'src/errors/unknown.error';
import { SendActionDraftRequest, SendActionDraftResponse } from 'src/models/methods/drafts';
import { WithoutId } from 'src/utils/types';
import { DraftParser, DraftSerializeParams } from './draft-parser';

const errorMap: Partial<Record<number, typeof TonConnectError>> = {
    [SEND_TRANSACTION_ERROR_CODES.UNKNOWN_ERROR]: UnknownError,
    [SEND_TRANSACTION_ERROR_CODES.USER_REJECTS_ERROR]: UserRejectsError,
    [SEND_TRANSACTION_ERROR_CODES.BAD_REQUEST_ERROR]: BadRequestError,
    [SEND_TRANSACTION_ERROR_CODES.UNKNOWN_APP_ERROR]: UnknownAppError
};

class SendActionDraftParser extends DraftParser<'sendAction'> {
    serialize(
        request: SendActionDraftRequest,
        params: DraftSerializeParams
    ): WithoutId<RawActionDraftRequest> {
        return {
            m: 'actionDraft',
            c: params.connectRequest,
            a: request.actionUrl
        };
    }

    convertFromResponse(response: unknown): SendActionDraftResponse {
        return (response as { result: SendActionDraftResponse }).result;
    }

    parseAndThrowError(response: { error: { code: number; message: string } }): never {
        this.throwMappedError(errorMap, response);
    }
}

export const sendActionDraftParser = new SendActionDraftParser();

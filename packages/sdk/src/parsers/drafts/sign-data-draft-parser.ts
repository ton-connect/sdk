import { RawSignDataDraftPayload, SIGN_DATA_ERROR_CODES } from '@tonconnect/protocol';
import { BadRequestError, TonConnectError, UnknownAppError, UserRejectsError } from 'src/errors';
import { UnknownError } from 'src/errors/unknown.error';
import { SignDataResponse } from 'src/models/methods';
import { SignDataDraftRequest } from 'src/models/methods/drafts';
import { DraftParser, DraftSerializeParams } from './draft-parser';

const errorMap: Partial<Record<number, typeof TonConnectError>> = {
    [SIGN_DATA_ERROR_CODES.UNKNOWN_ERROR]: UnknownError,
    [SIGN_DATA_ERROR_CODES.USER_REJECTS_ERROR]: UserRejectsError,
    [SIGN_DATA_ERROR_CODES.BAD_REQUEST_ERROR]: BadRequestError,
    [SIGN_DATA_ERROR_CODES.UNKNOWN_APP_ERROR]: UnknownAppError
};

class SignDataDraftParser extends DraftParser<'signData'> {
    serialize(
        request: SignDataDraftRequest,
        params: DraftSerializeParams
    ): Omit<RawSignDataDraftPayload, 'id'> {
        const payload: Record<string, unknown> = { ...request.payload };
        if (request.network) {
            payload.network = request.network;
        }
        if (request.from) {
            payload.from = request.from;
        }

        return {
            method: 'signData',
            params: [JSON.stringify(payload)],
            c: params.connectRequest
        };
    }

    convertFromResponse(response: unknown): SignDataResponse {
        const typed = response as { result: SignDataResponse };
        return typed.result;
    }

    parseAndThrowError(response: { error: { code: number; message: string } }): never {
        this.throwMappedError(errorMap, response);
    }
}

export const signDataDraftParser = new SignDataDraftParser();

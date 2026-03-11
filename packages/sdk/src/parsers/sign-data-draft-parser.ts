import { AppRequest, SignDataPayload, SIGN_DATA_ERROR_CODES } from '@tonconnect/protocol';
import { BadRequestError, TonConnectError, UnknownAppError, UserRejectsError } from 'src/errors';
import { UnknownError } from 'src/errors/unknown.error';
import { SignDataResponse } from 'src/models/methods';
import { RpcParser } from 'src/parsers/rpc-parser';
import { WithoutId } from 'src/utils/types';

const errorMap: Partial<Record<number, typeof TonConnectError>> = {
    [SIGN_DATA_ERROR_CODES.UNKNOWN_ERROR]: UnknownError,
    [SIGN_DATA_ERROR_CODES.USER_REJECTS_ERROR]: UserRejectsError,
    [SIGN_DATA_ERROR_CODES.BAD_REQUEST_ERROR]: BadRequestError,
    [SIGN_DATA_ERROR_CODES.UNKNOWN_APP_ERROR]: UnknownAppError
};

class SignDataDraftParser extends RpcParser<'signData'> {
    convertToRpcRequest(payload: SignDataPayload): WithoutId<AppRequest<'signData'>> {
        return {
            method: 'signData',
            params: [JSON.stringify(payload)]
        };
    }

    convertFromRpcResponse(response: unknown): SignDataResponse {
        const typed = response as { result: SignDataResponse };
        return typed.result;
    }

    parseAndThrowError(response: { error: { code: number; message: string } }): never {
        const ErrorConstructor = errorMap[response.error.code] ?? UnknownError;
        throw new ErrorConstructor(response.error.message);
    }
}

export const signDataDraftParser = new SignDataDraftParser();

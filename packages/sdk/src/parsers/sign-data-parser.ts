import {
    CONNECT_EVENT_ERROR_CODES,
    SIGN_DATA_ERROR_CODES,
    SignDataPayload,
    SignDataRpcRequest,
    SignDataRpcResponseError,
    SignDataRpcResponseSuccess
} from '@tonconnect/protocol';
import { BadRequestError, TonConnectError, UnknownAppError, UserRejectsError } from 'src/errors';
import { UnknownError } from 'src/errors/unknown.error';
import { SignDataResponse } from 'src/models/methods';
import { RpcParser } from 'src/parsers/rpc-parser';
import { WithoutId } from 'src/utils/types';

const signDataErrors: Partial<Record<CONNECT_EVENT_ERROR_CODES, typeof TonConnectError>> = {
    [SIGN_DATA_ERROR_CODES.UNKNOWN_ERROR]: UnknownError,
    [SIGN_DATA_ERROR_CODES.USER_REJECTS_ERROR]: UserRejectsError,
    [SIGN_DATA_ERROR_CODES.BAD_REQUEST_ERROR]: BadRequestError,
    [SIGN_DATA_ERROR_CODES.UNKNOWN_APP_ERROR]: UnknownAppError
};

class SignDataParser extends RpcParser<'signData'> {
    convertToRpcRequest(payload: SignDataPayload): WithoutId<SignDataRpcRequest> {
        return {
            method: 'signData',
            params: payload
        };
    }

    parseAndThrowError(response: WithoutId<SignDataRpcResponseError>): never {
        let ErrorConstructor: typeof TonConnectError = UnknownError;

        if (response.error.code in signDataErrors) {
            ErrorConstructor = signDataErrors[response.error.code] || UnknownError;
        }

        throw new ErrorConstructor(response.error.message);
    }

    convertFromRpcResponse(rpcResponse: WithoutId<SignDataRpcResponseSuccess>): SignDataResponse {
        return rpcResponse.result;
    }
}

export const signDataParser = new SignDataParser();

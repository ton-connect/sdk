import {
    CONNECT_EVENT_ERROR_CODES,
    SIGN_MESSAGE_ERROR_CODES,
    SignMessageRpcRequest,
    SignMessageRpcResponseError,
    SignMessageRpcResponseSuccess
} from '@tonconnect/protocol';
import { BadRequestError, TonConnectError, UnknownAppError, UserRejectsError } from 'src/errors';
import { UnknownError } from 'src/errors/unknown.error';
import { SignMessageRequest, SignMessageResponse } from 'src/models/methods';
import { RpcParser } from 'src/parsers/rpc-parser';
import { WithoutId } from 'src/utils/types';

type ArrayElement<T> = T extends Array<infer U> ? U : never;
type Message = ArrayElement<SignMessageRequest['messages']>;

const signMessageErrors: Partial<Record<CONNECT_EVENT_ERROR_CODES, typeof TonConnectError>> = {
    [SIGN_MESSAGE_ERROR_CODES.UNKNOWN_ERROR]: UnknownError,
    [SIGN_MESSAGE_ERROR_CODES.USER_REJECTS_ERROR]: UserRejectsError,
    [SIGN_MESSAGE_ERROR_CODES.BAD_REQUEST_ERROR]: BadRequestError,
    [SIGN_MESSAGE_ERROR_CODES.UNKNOWN_APP_ERROR]: UnknownAppError
};

class SignMessageParser extends RpcParser<'signMessage'> {
    convertToRpcRequest(
        request: Omit<SignMessageRequest, 'validUntil' | 'messages'> & {
            valid_until: number;
            messages: Array<
                Omit<Message, 'extraCurrency'> & { extra_currency?: Message['extraCurrency'] }
            >;
        }
    ): WithoutId<SignMessageRpcRequest> {
        return {
            method: 'signMessage',
            params: [JSON.stringify(request)]
        };
    }

    parseAndThrowError(response: WithoutId<SignMessageRpcResponseError>): never {
        let ErrorConstructor: typeof TonConnectError = UnknownError;

        if (response.error.code in signMessageErrors) {
            ErrorConstructor = signMessageErrors[response.error.code] || UnknownError;
        }

        throw new ErrorConstructor(response.error.message);
    }

    convertFromRpcResponse(
        rpcResponse: WithoutId<SignMessageRpcResponseSuccess>
    ): SignMessageResponse {
        return {
            boc: rpcResponse.result
        };
    }
}

export const signMessageParser = new SignMessageParser();

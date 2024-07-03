import {
    CONNECT_EVENT_ERROR_CODES,
    DecryptDataRpcRequest,
    DecryptDataRpcResponseSuccess,
    EncryptDataRpcRequest,
    EncryptDataRpcResponseSuccess,
    SEND_TRANSACTION_ERROR_CODES,
    SendTransactionRpcRequest,
    SendTransactionRpcResponseError,
    SendTransactionRpcResponseSuccess
} from '@tonconnect/protocol';
import { BadRequestError, TonConnectError, UnknownAppError, UserRejectsError } from 'src/errors';
import { UnknownError } from 'src/errors/unknown.error';
import { DecryptDataRequest, DecryptDataResponse, EncryptDataRequest, EncryptDataResponse, SendTransactionRequest, SendTransactionResponse } from 'src/models/methods';
import { RpcParser } from 'src/parsers/rpc-parser';
import { WithoutId } from 'src/utils/types';

const sendTransactionErrors: Partial<Record<CONNECT_EVENT_ERROR_CODES, typeof TonConnectError>> = {
    [SEND_TRANSACTION_ERROR_CODES.UNKNOWN_ERROR]: UnknownError,
    [SEND_TRANSACTION_ERROR_CODES.USER_REJECTS_ERROR]: UserRejectsError,
    [SEND_TRANSACTION_ERROR_CODES.BAD_REQUEST_ERROR]: BadRequestError,
    [SEND_TRANSACTION_ERROR_CODES.UNKNOWN_APP_ERROR]: UnknownAppError
};

class SendTransactionParser extends RpcParser<'sendTransaction'> {
    convertToRpcRequest(
        request: Omit<SendTransactionRequest, 'validUntil'> & { valid_until: number }
    ): WithoutId<SendTransactionRpcRequest> {
        return {
            method: 'sendTransaction',
            params: [JSON.stringify(request)]
        };
    }

    convertToRpcRequestEncrypt(
        request: Omit<EncryptDataRequest, 'id'>
    ): WithoutId<EncryptDataRpcRequest> {
        return {
            method: 'encryptData',
            params: [JSON.stringify(request)]
        };
    }

    convertToRpcRequestDecrypt(
        request: Omit<DecryptDataRequest, 'id'>
    ): WithoutId<DecryptDataRpcRequest> {
        return {
            method: 'decryptData',
            params: [JSON.stringify(request)]
        };
    }

    parseAndThrowError(response: WithoutId<SendTransactionRpcResponseError>): never {
        let ErrorConstructor: typeof TonConnectError = UnknownError;

        if (response.error.code in sendTransactionErrors) {
            ErrorConstructor = sendTransactionErrors[response.error.code] || UnknownError;
        }

        throw new ErrorConstructor(response.error.message);
    }

    convertFromRpcResponse(
        rpcResponse: WithoutId<SendTransactionRpcResponseSuccess>
    ): SendTransactionResponse {
        return {
            boc: rpcResponse.result
        };
    }

    convertFromRpcResponseEncrypt(
        rpcResponse: WithoutId<EncryptDataRpcResponseSuccess>
    ): EncryptDataResponse {
        return {
            // rpcResponse.result
            boc: rpcResponse.result
        };
    }

    convertFromRpcResponseDecrypt(
        rpcResponse: WithoutId<DecryptDataRpcResponseSuccess>
    ): DecryptDataResponse {
        return {
            result: rpcResponse.result
        };
    }
}

export const sendTransactionParser = new SendTransactionParser();

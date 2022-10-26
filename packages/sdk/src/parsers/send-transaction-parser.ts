import {
    SEND_TRANSACTION_ERROR_CODES,
    SendTransactionRpcRequest,
    SendTransactionRpcResponseError,
    SendTransactionRpcResponseSuccess
} from '@tonconnect/protocol';
import { UserRejectsError } from 'src/errors';
import { UnknownError } from 'src/errors/unknown.error';
import { SendTransactionRequest, SendTransactionResponse } from 'src/models/methods';
import { RpcParser } from 'src/parsers/rpc-parser';
import { WithoutId } from 'src/utils/types';

const sendTransactionErrors = {
    [SEND_TRANSACTION_ERROR_CODES.UNKNOWN_ERROR]: UnknownError,
    [SEND_TRANSACTION_ERROR_CODES.USER_REJECTS_ERROR]: UserRejectsError
};

class SendTransactionParser extends RpcParser<'sendTransaction'> {
    convertToRpcRequest(request: SendTransactionRequest): WithoutId<SendTransactionRpcRequest> {
        return {
            method: 'sendTransaction',
            params: [JSON.stringify(request)]
        };
    }

    parseAndThrowError(response: WithoutId<SendTransactionRpcResponseError>): never {
        throw new sendTransactionErrors[response.error.code](response.error.message);
    }

    convertFromRpcResponse(
        rpcResponse: WithoutId<SendTransactionRpcResponseSuccess>
    ): SendTransactionResponse {
        return {
            boc: rpcResponse.result
        };
    }
}

export const sendTransactionParser = new SendTransactionParser();

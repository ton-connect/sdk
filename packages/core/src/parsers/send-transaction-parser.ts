import { SendTransactionRpcRequest } from 'src/models';
import { SendTransactionRequest, SendTransactionResponse } from 'src/models/methods';
import {
    sendTransactionErrors,
    SendTransactionRpcResponseError,
    SendTransactionRpcResponseSuccess
} from 'src/models/protocol/wallet-message/wallet-response/send-transaction-rpc-response';
import { RpcParser } from 'src/parsers/rpc-parser';
import { WithoutId } from 'src/utils/types';

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

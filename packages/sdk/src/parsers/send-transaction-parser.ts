import {
    ChainId,
    RpcStructuredItem,
    SendTransactionRpcRequest,
    SendTransactionRpcResponseError,
    SendTransactionRpcResponseSuccess
} from '@tonconnect/protocol';
import {
    RPC_WALLET_ERRORS,
    walletResponseToError
} from 'src/errors/wallet-response/wallet-response-to-error';
import { SendTransactionResponse } from 'src/models/methods';
import { responseIdOf, RpcParser } from 'src/parsers/rpc-parser';
import { WithoutId } from 'src/utils/types';

class SendTransactionParser extends RpcParser<'sendTransaction'> {
    convertToRpcRequest(
        request: {
            from: string;
            network: ChainId;
            valid_until: number;
        } & (
            | {
                  messages: Array<{
                      address: string;
                      amount: string;
                      stateInit?: string;
                      payload?: string;
                      extra_currency?: { [k: number]: string };
                  }>;
                  items?: never;
              }
            | {
                  items: RpcStructuredItem[];
                  messages?: never;
              }
        )
    ): WithoutId<SendTransactionRpcRequest> {
        return {
            method: 'sendTransaction',
            params: [JSON.stringify(request)]
        };
    }

    parseAndThrowError(response: WithoutId<SendTransactionRpcResponseError>): never {
        throw walletResponseToError(response.error, RPC_WALLET_ERRORS, {
            responseId: responseIdOf(response)
        });
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

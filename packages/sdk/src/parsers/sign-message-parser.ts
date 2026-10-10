import {
    ChainId,
    RpcStructuredItem,
    SignMessageRpcRequest,
    SignMessageRpcResponseError,
    SignMessageRpcResponseSuccess
} from '@tonconnect/protocol';
import {
    RPC_WALLET_ERRORS,
    walletResponseToError
} from 'src/errors/wallet-response/wallet-response-to-error';
import { SignMessageResponse } from 'src/models/methods';
import { responseIdOf, RpcParser } from 'src/parsers/rpc-parser';
import { WithoutId } from 'src/utils/types';

export class SignMessageParser extends RpcParser<'signMessage'> {
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
    ): WithoutId<SignMessageRpcRequest> {
        return {
            method: 'signMessage',
            params: [JSON.stringify(request)]
        };
    }

    parseAndThrowError(response: WithoutId<SignMessageRpcResponseError>): never {
        throw walletResponseToError(response.error, RPC_WALLET_ERRORS, {
            responseId: responseIdOf(response)
        });
    }

    convertFromRpcResponse(
        rpcResponse: WithoutId<SignMessageRpcResponseSuccess>
    ): SignMessageResponse {
        return {
            internalBoc: rpcResponse.result.internalBoc
        };
    }
}

export const signMessageParser = new SignMessageParser();

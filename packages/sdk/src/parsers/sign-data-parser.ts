import {
    SignDataPayload,
    SignDataRpcRequest,
    SignDataRpcResponseError,
    SignDataRpcResponseSuccess
} from '@tonconnect/protocol';
import {
    RPC_WALLET_ERRORS,
    walletResponseToError
} from 'src/errors/wallet-response/wallet-response-to-error';
import { SignDataResponse } from 'src/models/methods';
import { responseIdOf, RpcParser } from 'src/parsers/rpc-parser';
import { WithoutId } from 'src/utils/types';

class SignDataParser extends RpcParser<'signData'> {
    convertToRpcRequest(payload: SignDataPayload): WithoutId<SignDataRpcRequest> {
        return {
            method: 'signData',
            params: [JSON.stringify(payload)]
        };
    }

    parseAndThrowError(response: WithoutId<SignDataRpcResponseError>): never {
        throw walletResponseToError(response.error, RPC_WALLET_ERRORS, {
            responseId: responseIdOf(response)
        });
    }

    convertFromRpcResponse(rpcResponse: WithoutId<SignDataRpcResponseSuccess>): SignDataResponse {
        return rpcResponse.result;
    }
}

export const signDataParser = new SignDataParser();

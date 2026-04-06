import { RpcParser } from 'src/parsers/rpc-parser';
import {
    AppRequest,
    IntentRpcMethod,
    SendActionDraftResponseError,
    SendTransactionDraftResponseError,
    SignDataRpcResponseError,
    SignMessageDraftResponseError,
    WalletResponseSuccess
} from '@tonconnect/protocol';
import { WithoutId } from 'src/utils/types';
import { arbitraryResponseParser } from 'src/parsers/arbitrary-response.parser';

class IntentResponseParser extends RpcParser<IntentRpcMethod> {
    convertToRpcRequest(..._args: unknown[]): WithoutId<AppRequest<IntentRpcMethod>> {
        throw new Error('Method not implemented.');
    }

    convertFromRpcResponse(rpcResponse: WithoutId<WalletResponseSuccess<IntentRpcMethod>>) {
        return arbitraryResponseParser.convertFromRpcResponse(rpcResponse);
    }

    parseAndThrowError(
        _response: WithoutId<
            | SignDataRpcResponseError
            | SendTransactionDraftResponseError
            | SignMessageDraftResponseError
            | SendActionDraftResponseError
        >
    ): never {
        throw new Error('Method not implemented.');
    }
}

export const intentResponseParser = new IntentResponseParser();

import { RpcParser } from 'src/parsers/rpc-parser';
import {
    AppRequest,
    IntentRpcMethod,
    SendActionDraftResponseError,
    SendTransactionDraftResponseError,
    SignDataPayload,
    SignDataRpcResponseError,
    SignMessageDraftResponseError,
    WalletResponseSuccess
} from '@tonconnect/protocol';
import { WithoutId } from 'src/utils/types';
import { arbitraryResponseParser } from 'src/parsers/arbitrary-response.parser';
import { signDataParser } from 'src/parsers/sign-data-parser';
import { sendTransactionDraftParser } from 'src/parsers/send-transaction-draft-parser';
import {
    IntentRequest,
    SendActionDraftRequest,
    SendTransactionDraftRequest,
    SignMessageDraftRequest
} from 'src/models';
import { signMessageDraftParser } from 'src/parsers/sign-message-draft-parser';
import { sendActionDraftParser } from 'src/parsers/send-action-draft-parser';
import { TonConnectError } from 'src/errors';

class IntentParser extends RpcParser<IntentRpcMethod> {
    convertToRpcRequest(intentRequest: IntentRequest): WithoutId<AppRequest<IntentRpcMethod>> {
        const { method, omitConnect, ...payload } = intentRequest;
        void omitConnect;

        switch (method) {
            case 'txDraft':
                return sendTransactionDraftParser.convertToRpcRequest(
                    payload as SendTransactionDraftRequest
                );
            case 'signData': {
                return signDataParser.convertToRpcRequest(payload as SignDataPayload);
            }
            case 'signMsgDraft':
                return signMessageDraftParser.convertToRpcRequest(
                    payload as SignMessageDraftRequest
                );
            case 'actionDraft':
                return sendActionDraftParser.convertToRpcRequest(payload as SendActionDraftRequest);
        }

        throw new TonConnectError(`Unsupported intent method ${method}`);
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

export const intentParser = new IntentParser();

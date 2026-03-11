import { SendTransactionRpcRequest } from './send-transaction-rpc-request';
import { SignDataRpcRequest } from './sign-data-rpc-request';
import { SignMessageRpcRequest } from './sign-message-rpc-request';
import { RpcMethod } from '../../rpc-method';
import { DisconnectRpcRequest } from './disconnect-rpc-request';
import { RawActionDraftRequest } from './send-action-draft';
import { RawSignMessageDraftRequest } from './sign-message-draft';
import { RawSendTransactionDraftRequest } from './send-transaction-draft';

export type RpcRequests = {
    sendTransaction: SendTransactionRpcRequest;
    signData: SignDataRpcRequest;
    signMessage: SignMessageRpcRequest;
    disconnect: DisconnectRpcRequest;
    sendTransactionDraft: RawSendTransactionDraftRequest;
    signMessageDraft: RawSignMessageDraftRequest;
    sendAction: RawActionDraftRequest;
};

export type AppRequest<T extends RpcMethod> = RpcRequests[T];

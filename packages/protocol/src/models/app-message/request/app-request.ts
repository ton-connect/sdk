import { SendTransactionRpcRequest } from './send-transaction-rpc-request';
import { SignDataRpcRequest } from './sign-data-rpc-request';
import { SignMessageRpcRequest } from './sign-message-rpc-request';
import { RpcMethod } from '../../rpc-method';
import { DisconnectRpcRequest } from './disconnect-rpc-request';

export type RpcRequests = {
    sendTransaction: SendTransactionRpcRequest;
    signData: SignDataRpcRequest;
    signMessage: SignMessageRpcRequest;
    disconnect: DisconnectRpcRequest;
};

export type AppRequest<T extends RpcMethod> = RpcRequests[T];

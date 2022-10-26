import { SendTransactionRpcRequest } from './send-transaction-rpc-request';
import { RpcMethod } from '../../rpc-method';

export type RpcRequests = {
    sendTransaction: SendTransactionRpcRequest;
};

export type AppRequest<T extends RpcMethod> = RpcRequests[T];

import { SendTransactionRpcRequest } from 'src/models/protocol/app-message/request/send-transaction-rpc-request';
import { RpcMethod } from 'src/models/protocol/rpc-method';

export type RpcRequests = {
    sendTransaction: SendTransactionRpcRequest;
};

export type AppRequest<T extends RpcMethod> = RpcRequests[T];

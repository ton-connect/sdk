import { SendTransactionRequest } from 'src/models/protocol/app-message/request/send-transaction-request';
import { RpcMethod } from 'src/models/protocol/rpc-method';

export type RpcRequests = {
    sendTransaction: SendTransactionRequest;
};

export type AppRequest<T extends RpcMethod> = RpcRequests[T];

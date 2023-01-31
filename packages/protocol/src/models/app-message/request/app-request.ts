import { SendTransactionRpcRequest } from './send-transaction-rpc-request';
import { SignDataRpcRequest } from './sign-data-rpc-request';
import { RpcMethod } from '../../rpc-method';

export type RpcRequests = {
    sendTransaction: SendTransactionRpcRequest;
    signData: SignDataRpcRequest;
};

export type AppRequest<T extends RpcMethod> = RpcRequests[T];

import { SendTransactionRpcRequest } from './send-transaction-rpc-request';
import { SignDataRpcRequest } from './sign-data-rpc-request';
import { RpcMethod } from '../../rpc-method';
import { DisconnectRpcRequest } from './disconnect-rpc-request';
import { EncryptDataRpcRequest } from './encrypt-data-rpc-request';
import { DecryptDataRpcRequest } from './decrypt-data-rpc-request';
export declare type RpcRequests = {
    sendTransaction: SendTransactionRpcRequest;
    signData: SignDataRpcRequest;
    disconnect: DisconnectRpcRequest;
    encryptData: EncryptDataRpcRequest;
    decryptData: DecryptDataRpcRequest;
};
export declare type AppRequest<T extends RpcMethod> = RpcRequests[T];

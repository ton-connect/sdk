import { SendTransactionRpcRequest } from './send-transaction-rpc-request';
import { SignDataRpcRequest } from './sign-data-rpc-request';
import { SignMessageRpcRequest } from './sign-message-rpc-request';
import { RpcMethod } from '../../rpc-method';
import { DisconnectRpcRequest } from './disconnect-rpc-request';

/**
 * Map from RPC method name to its request envelope. Used both as a type
 * registry and to derive {@link AppRequest} via index lookup.
 */
export type RpcRequests = {
    sendTransaction: SendTransactionRpcRequest;
    signData: SignDataRpcRequest;
    signMessage: SignMessageRpcRequest;
    disconnect: DisconnectRpcRequest;
};

/**
 * Request envelope for the given RPC `method`. Each envelope follows the
 * same `{ method, params, id }` structure;
 *
 * @see [RPC envelope (RPC spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md#envelope)
 */
export type AppRequest<T extends RpcMethod> = RpcRequests[T];

import { SendTransactionRpcRequest } from './send-transaction-rpc-request';
import { SignDataRpcRequest } from './sign-data-rpc-request';
import { SignMessageRpcRequest } from './sign-message-rpc-request';
import { RpcMethod } from '../../rpc-method';
import { DisconnectRpcRequest } from './disconnect-rpc-request';

/**
 * Map from each {@link RpcMethod} name to its request payload type. Used
 * internally to derive {@link AppRequest}; consumers usually reach for
 * `AppRequest<'sendTransaction'>` etc. instead.
 */
export type RpcRequests = {
    sendTransaction: SendTransactionRpcRequest;
    signData: SignDataRpcRequest;
    signMessage: SignMessageRpcRequest;
    disconnect: DisconnectRpcRequest;
};

/**
 * Request the app sends to the wallet for the given JSON-RPC method `T`.
 *
 * @example
 * ```ts
 * declare const req: AppRequest<'sendTransaction'>;
 * // req.method  is 'sendTransaction'
 * // req.params  is [string] (JSON-stringified payload)
 * ```
 */
export type AppRequest<T extends RpcMethod> = RpcRequests[T];

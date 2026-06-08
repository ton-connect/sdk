import { RpcMethod } from '../../rpc-method';
import {
    SendTransactionRpcResponseError,
    SendTransactionRpcResponseSuccess
} from './send-transaction-rpc-response';
import { SignDataRpcResponseError, SignDataRpcResponseSuccess } from './sign-data-rpc-response';
import {
    SignMessageRpcResponseError,
    SignMessageRpcResponseSuccess
} from './sign-message-rpc-response';
import {
    DisconnectRpcResponseError,
    DisconnectRpcResponseSuccess
} from './disconnect-rpc-response';

/**
 * Map from RPC method name to its success / error response envelope.
 *
 * Used to derive {@link WalletResponse}.
 */
export type RpcResponses = {
    sendTransaction: {
        error: SendTransactionRpcResponseError;
        success: SendTransactionRpcResponseSuccess;
    };

    signData: {
        error: SignDataRpcResponseError;
        success: SignDataRpcResponseSuccess;
    };

    signMessage: {
        error: SignMessageRpcResponseError;
        success: SignMessageRpcResponseSuccess;
    };

    disconnect: {
        error: DisconnectRpcResponseError;
        success: DisconnectRpcResponseSuccess;
    };
};

export type WalletResponseSuccess<T extends RpcMethod> = RpcResponses[T]['success'];

export type WalletResponseError<T extends RpcMethod> = RpcResponses[T]['error'];

/**
 * Wallet reply to an {@link AppRequest}.
 *
 * @see [`WalletResponse` (RPC spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md#walletresponse)
 */
export type WalletResponse<T extends RpcMethod> = WalletResponseSuccess<T> | WalletResponseError<T>;

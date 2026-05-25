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
 * Map from each {@link RpcMethod} to its `{ success, error }` pair of
 * response payload types. Used internally to derive
 * {@link WalletResponseSuccess} / {@link WalletResponseError}.
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

/** Success variant of the wallet's response to method `T`. */
export type WalletResponseSuccess<T extends RpcMethod> = RpcResponses[T]['success'];

/** Error variant of the wallet's response to method `T`. */
export type WalletResponseError<T extends RpcMethod> = RpcResponses[T]['error'];

/**
 * Wallet's response to an {@link AppRequest} of method `T` — either the
 * success or error variant. Disambiguate by checking for the `error` field.
 */
export type WalletResponse<T extends RpcMethod> = WalletResponseSuccess<T> | WalletResponseError<T>;

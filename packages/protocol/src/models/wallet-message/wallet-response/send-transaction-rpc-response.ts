import {
    WalletResponseTemplateError,
    WalletResponseTemplateSuccess
} from './wallet-response-template';

/**
 * Wallet reply to a `sendTransaction` RPC.
 */
export type SendTransactionRpcResponse =
    | SendTransactionRpcResponseSuccess
    | SendTransactionRpcResponseError;

/**
 * Success: `result` is the base64-encoded BoC of the external message.
 */
export interface SendTransactionRpcResponseSuccess extends WalletResponseTemplateSuccess {}

/** Failure envelope. */
export interface SendTransactionRpcResponseError extends WalletResponseTemplateError {
    error: { code: SEND_TRANSACTION_ERROR_CODES; message: string; data?: unknown };
    id: string;
}

/**
 * Error codes the wallet may return from `sendTransaction`.
 *
 * @see [`sendTransaction` errors (RPC spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md#sendtransaction)
 */
export enum SEND_TRANSACTION_ERROR_CODES {
    /** Unexpected wallet-side failure. */
    UNKNOWN_ERROR = 0,
    /** Request payload is malformed. */
    BAD_REQUEST_ERROR = 1,
    /** Wallet does not know the dApp / session. */
    UNKNOWN_APP_ERROR = 100,
    /** User explicitly declined the transaction. */
    USER_REJECTS_ERROR = 300,
    /** Wallet does not support the method. */
    METHOD_NOT_SUPPORTED = 400
}

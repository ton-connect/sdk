import { WalletResponseTemplateError } from './wallet-response-template';

/**
 * Wallet reply to a `disconnect` RPC. Success carries an empty result; error
 * narrows the `code` enum to {@link DISCONNECT_ERROR_CODES}.
 */
export type DisconnectRpcResponse = DisconnectRpcResponseSuccess | DisconnectRpcResponseError;

/** Success envelope. `result` is empty — the wallet just acknowledged. */
export interface DisconnectRpcResponseSuccess {
    /** Echo of the request `id`. */
    id: string;
    /** Empty. Reserved for future fields. */
    result: {};
}

/** Failure envelope. `code` is one of {@link DISCONNECT_ERROR_CODES}. */
export interface DisconnectRpcResponseError extends WalletResponseTemplateError {
    error: { code: DISCONNECT_ERROR_CODES; message: string; data?: unknown };
    id: string;
}

/**
 * Error codes the wallet may return from `disconnect`.

 * @see [`disconnect` errors (RPC spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md#disconnect)
 */
export enum DISCONNECT_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    BAD_REQUEST_ERROR = 1,
    UNKNOWN_APP_ERROR = 100,
    METHOD_NOT_SUPPORTED = 400
}

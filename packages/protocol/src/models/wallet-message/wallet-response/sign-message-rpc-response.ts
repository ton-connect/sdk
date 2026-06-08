import { WalletResponseTemplateError } from './wallet-response-template';

/**
 * Wallet reply to a `signMessage` RPC. Success carries the signed internal
 * message BoC; error narrows the `code` enum to
 * {@link SIGN_MESSAGE_ERROR_CODES}.
 */
export type SignMessageRpcResponse = SignMessageRpcResponseSuccess | SignMessageRpcResponseError;

export interface SignMessageRpcResponseSuccess {
    result: {
        /**
         * Base64-encoded BoC of the signed internal message.
         */
        internalBoc: string;
    };
    /** Echo of the request `id`. */
    id: string;
}

export interface SignMessageRpcResponseError extends WalletResponseTemplateError {
    error: { code: SIGN_MESSAGE_ERROR_CODES; message: string; data?: unknown };
    id: string;
}

/**
 * Error codes the wallet may return from `signMessage`.
 *
 * @see [`signMessage` errors (RPC spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md#signmessage)
 */
export enum SIGN_MESSAGE_ERROR_CODES {
    /** Unexpected wallet-side failure. */
    UNKNOWN_ERROR = 0,
    /** Invalid request payload. */
    BAD_REQUEST_ERROR = 1,
    /** Wallet does not know the dApp / session. */
    UNKNOWN_APP_ERROR = 100,
    /** User explicitly declined. */
    USER_REJECTS_ERROR = 300,
    /** Wallet does not support `signMessage`. */
    METHOD_NOT_SUPPORTED = 400
}

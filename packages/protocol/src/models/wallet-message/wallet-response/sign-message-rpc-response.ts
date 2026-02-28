import {
    WalletResponseTemplateError,
    WalletResponseTemplateSuccess
} from './wallet-response-template';

export type SignMessageRpcResponse = SignMessageRpcResponseSuccess | SignMessageRpcResponseError;

export interface SignMessageRpcResponseSuccess extends WalletResponseTemplateSuccess {}

export interface SignMessageRpcResponseError extends WalletResponseTemplateError {
    error: { code: SIGN_MESSAGE_ERROR_CODES; message: string; data?: unknown };
    id: string;
}

export enum SIGN_MESSAGE_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    BAD_REQUEST_ERROR = 1,
    UNKNOWN_APP_ERROR = 100,
    USER_REJECTS_ERROR = 300,
    METHOD_NOT_SUPPORTED = 400
}

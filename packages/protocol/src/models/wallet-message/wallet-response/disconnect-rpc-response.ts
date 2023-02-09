import { WalletResponseTemplateError } from './wallet-response-template';

export type DisconnectRpcResponse = DisconnectRpcResponseSuccess | DisconnectRpcResponseError;

export interface DisconnectRpcResponseSuccess {
    id: string;
    result: {};
}

export interface DisconnectRpcResponseError extends WalletResponseTemplateError {
    error: { code: DISCONNECT_ERROR_CODES; message: string; data?: unknown };
    id: string;
}

export enum DISCONNECT_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    BAD_REQUEST_ERROR = 1,
    UNKNOWN_APP_ERROR = 100,
    METHOD_NOT_SUPPORTED = 400
}

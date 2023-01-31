import { WalletResponseTemplateError } from './wallet-response-template';

export type SignDataRpcResponse = SignDataRpcResponseSuccess | SignDataRpcResponseError;

export interface SignDataRpcResponseSuccess {
    id: string;
    result: {
        signature: string;
        timestamp: string;
    };
}

export interface SignDataRpcResponseError extends WalletResponseTemplateError {
    error: { code: SIGN_DATA_ERROR_CODES; message: string; data?: unknown };
    id: string;
}

export enum SIGN_DATA_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    BAD_REQUEST_ERROR = 1,
    UNKNOWN_APP_ERROR = 100,
    USER_REJECTS_ERROR = 300,
    METHOD_NOT_SUPPORTED = 400
}

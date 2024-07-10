import { WalletResponseTemplateError } from './wallet-response-template';
export declare type EncryptDataRpcResponse = EncryptDataRpcResponseSuccess | EncryptDataRpcResponseError;
export interface EncryptDataRpcResponseSuccess {
    id: string;
    result: {
        encrypted_data: string;
    };
}
export interface EncryptDataRpcResponseError extends WalletResponseTemplateError {
    error: {
        code: ENCRYPT_DATA_ERROR_CODES;
        message: string;
        data?: unknown;
    };
    id: string;
}
export declare enum ENCRYPT_DATA_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    BAD_REQUEST_ERROR = 1,
    UNKNOWN_APP_ERROR = 100,
    USER_REJECTS_ERROR = 300,
    METHOD_NOT_SUPPORTED = 400
}

import { WalletResponseTemplateError, WalletResponseTemplateSuccess } from './wallet-response-template';
//TODO: make them arrays

export type DecryptDataRpcResponse = DecryptDataRpcResponseSuccess | DecryptDataRpcResponseError;

// export interface DecryptDataRpcResponseSuccess {
//     id: string;
//     // result: {
//     //     // data: string[];
//     //     data: string;
//     // };
//     result: string;
// }

export interface DecryptDataRpcResponseSuccess {
    result: string[];
    id: string;
}

export interface DecryptDataRpcResponseError extends WalletResponseTemplateError {
    error: { code: DECRYPT_DATA_ERROR_CODES; message: string; data?: unknown };
    id: string;
}

export enum DECRYPT_DATA_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    BAD_REQUEST_ERROR = 1,
    UNKNOWN_APP_ERROR = 100,
    USER_REJECTS_ERROR = 300,
    METHOD_NOT_SUPPORTED = 400
}

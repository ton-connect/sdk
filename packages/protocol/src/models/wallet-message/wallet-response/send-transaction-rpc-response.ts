import {
    WalletResponseTemplateError,
    WalletResponseTemplateSuccess
} from './wallet-response-template';

export type SendTransactionRpcResponse =
    | SendTransactionRpcResponseSuccess
    | SendTransactionRpcResponseError;

export interface SendTransactionRpcResponseSuccess extends WalletResponseTemplateSuccess {}

export interface SendTransactionRpcResponseError extends WalletResponseTemplateError {
    error: { code: SEND_TRANSACTION_ERROR_CODES; message: string; data?: unknown };
    id: string;
}

export enum SEND_TRANSACTION_ERROR_CODES {
    BAD_REQUEST = -1,
    UNKNOWN_ERROR = 0,
    USER_REJECTS_ERROR = 1,
    UNKNOWN_APP = 2
}

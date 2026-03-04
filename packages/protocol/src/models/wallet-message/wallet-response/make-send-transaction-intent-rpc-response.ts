import { WalletResponseTemplateError } from './wallet-response-template';

export type MakeSendTransactionIntentRpcResponse =
    | MakeSendTransactionIntentRpcResponseSuccess
    | MakeSendTransactionIntentRpcResponseError;

export interface MakeSendTransactionIntentRpcResponseSuccess {
    result: string; // Message BoC
    id: string;
}

export interface MakeSendTransactionIntentRpcResponseError extends WalletResponseTemplateError {
    error: { code: MAKE_SEND_TRANSACTION_INTENT_ERROR_CODES; message: string; data?: unknown };
    id: string;
}

export enum MAKE_SEND_TRANSACTION_INTENT_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    BAD_REQUEST_ERROR = 1,
    UNKNOWN_APP_ERROR = 100,
    USER_REJECTS_ERROR = 300,
    METHOD_NOT_SUPPORTED = 400
}

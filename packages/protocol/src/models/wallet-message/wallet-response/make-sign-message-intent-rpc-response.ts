import { WalletResponseTemplateError } from './wallet-response-template';

export type MakeSignMessageIntentRpcResponse =
    | MakeSignMessageIntentRpcResponseSuccess
    | MakeSignMessageIntentRpcResponseError;

export interface MakeSignMessageIntentRpcResponseSuccess {
    result: string; // base64-encoded BoC of the signed message
    id: string;
}

export interface MakeSignMessageIntentRpcResponseError extends WalletResponseTemplateError {
    error: { code: MAKE_SIGN_MESSAGE_INTENT_ERROR_CODES; message: string; data?: unknown };
    id: string;
}

export enum MAKE_SIGN_MESSAGE_INTENT_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    BAD_REQUEST_ERROR = 1,
    UNKNOWN_APP_ERROR = 100,
    USER_REJECTS_ERROR = 300,
    METHOD_NOT_SUPPORTED = 400
}

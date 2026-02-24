import { SignDataRpcResponseSuccess } from './sign-data-rpc-response';
import { SendTransactionRpcResponseSuccess } from './send-transaction-rpc-response';

export type MakeSendActionIntentRpcResponse =
    | MakeSendActionIntentRpcResponseSuccess
    | MakeSendActionIntentRpcResponseError;

export type MakeSendActionIntentRpcResponseSuccess =
    | SignDataRpcResponseSuccess
    | SendTransactionRpcResponseSuccess;

export interface MakeSendActionIntentRpcResponseError {
    error: { code: MAKE_SEND_ACTION_INTENT_ERROR_CODES; message: string; data?: unknown };
    id: string;
}

export enum MAKE_SEND_ACTION_INTENT_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    BAD_REQUEST_ERROR = 1,
    UNKNOWN_APP_ERROR = 100,
    ACTION_URL_UNREACHABLE = 200,
    USER_REJECTS_ERROR = 300,
    METHOD_NOT_SUPPORTED = 400
}

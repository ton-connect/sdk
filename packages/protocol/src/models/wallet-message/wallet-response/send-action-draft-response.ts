import {
    SendTransactionRpcResponse,
    SendTransactionRpcResponseSuccess
} from './send-transaction-rpc-response';
import { SignDataRpcResponse, SignDataRpcResponseSuccess } from './sign-data-rpc-response';
import { SignMessageDraftResponse } from './sign-message-draft-response';
import { SignMessageRpcResponseSuccess } from './sign-message-rpc-response';
import { WalletResponseTemplateError } from './wallet-response-template';

export type SendActionDraftResponse =
    | SendTransactionRpcResponse
    | SignMessageDraftResponse
    | SignDataRpcResponse;

export type SendActionDraftResponseSuccess =
    | SendTransactionRpcResponseSuccess
    | SignMessageRpcResponseSuccess
    | SignDataRpcResponseSuccess;

export interface SendActionDraftResponseError extends WalletResponseTemplateError {
    error: { code: SEND_ACTION_DRAFT_ERROR_CODES; message: string; data?: unknown };
    id: string;
}

export enum SEND_ACTION_DRAFT_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    BAD_REQUEST_ERROR = 1,
    UNKNOWN_APP_ERROR = 100,
    USER_REJECTS_ERROR = 300,
    METHOD_NOT_SUPPORTED = 400
}

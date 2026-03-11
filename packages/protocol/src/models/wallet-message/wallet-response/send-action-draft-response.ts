import { SendTransactionRpcResponse } from './send-transaction-rpc-response';
import { SignDataRpcResponse } from './sign-data-rpc-response';
import { SignMessageDraftResponse } from './sign-message-draft-response';
import { WalletResponseTemplateError } from './wallet-response-template';

export type SendActionDraftResponse =
    | SendTransactionRpcResponse
    | SignMessageDraftResponse
    | SignDataRpcResponse;

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

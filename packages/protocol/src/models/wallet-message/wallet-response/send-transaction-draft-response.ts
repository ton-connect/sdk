import {
    SendTransactionRpcResponse,
    SendTransactionRpcResponseError,
    SendTransactionRpcResponseSuccess
} from './send-transaction-rpc-response';

export type SendTransactionDraftResponse = SendTransactionRpcResponse;

export interface SendTransactionDraftResponseSuccess extends SendTransactionRpcResponseSuccess {}

export interface SendTransactionDraftResponseError extends SendTransactionRpcResponseError {}

export enum SEND_TRANSACTION_DRAFT_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    BAD_REQUEST_ERROR = 1,
    UNKNOWN_APP_ERROR = 100,
    USER_REJECTS_ERROR = 300,
    METHOD_NOT_SUPPORTED = 400
}

import {
    SignMessageRpcResponse,
    SignMessageRpcResponseError,
    SignMessageRpcResponseSuccess
} from './sign-message-rpc-response';

export type SignMessageDraftResponse = SignMessageRpcResponse;

export interface SignMessageDraftResponseSuccess extends SignMessageRpcResponseSuccess {}

export interface SignMessageDraftResponseError extends SignMessageRpcResponseError {}

export enum SIGN_MESSAGE_DRAFT_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    BAD_REQUEST_ERROR = 1,
    UNKNOWN_APP_ERROR = 100,
    USER_REJECTS_ERROR = 300,
    METHOD_NOT_SUPPORTED = 400
}

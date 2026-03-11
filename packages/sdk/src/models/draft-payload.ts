import type { ConnectRequest } from '@tonconnect/protocol';
import type {
    RawSendTransactionDraftRequest,
    RawSignMessageDraftRequest,
    RawActionDraftRequest,
    SignDataRpcRequest
} from '@tonconnect/protocol';

export type RawIntentPayload =
    | RawSendTransactionDraftRequest
    | RawSignMessageDraftRequest
    | RawActionDraftRequest
    | SignDataRpcRequest;

export interface UniversalLinkMessage {
    connectRequest: ConnectRequest;
    draft?: RawIntentPayload;
}

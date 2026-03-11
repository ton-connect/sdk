import type { RawSendTransactionDraftRequest } from './send-transaction-draft';
import type { RawSignDataDraftPayload } from './sign-data-draft';
import type { RawSignMessageDraftRequest } from './sign-message-draft';
import type { RawActionDraftRequest } from './send-action-draft';

export type RawDraftRequest =
    | RawSendTransactionDraftRequest
    | RawSignMessageDraftRequest
    | RawActionDraftRequest;

export type RawDraftPayload = RawDraftRequest | RawSignDataDraftPayload;

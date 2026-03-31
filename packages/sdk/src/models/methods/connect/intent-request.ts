import { SignDataPayload } from '@tonconnect/protocol';
import { SendTransactionDraftRequest } from '../send-transaction-draft';
import { SignMessageDraftRequest } from '../sign-message-draft';
import { SendActionDraftRequest } from '../send-action-draft';

export type IntentRequest =
    | (SendTransactionDraftRequest & { method: 'txDraft' })
    | (SignDataPayload & { method: 'signData' })
    | (SignMessageDraftRequest & { method: 'signMsgDraft' })
    | (SendActionDraftRequest & { method: 'actionDraft' });

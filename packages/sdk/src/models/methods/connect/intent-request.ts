import { SignDataPayload } from '@tonconnect/protocol';
import { SendTransactionDraftRequest } from '../send-transaction-draft';
import { SignMessageDraftRequest } from '../sign-message-draft';
import { SendActionDraftRequest } from '../send-action-draft';

export type IntentRequest =
    | (SendTransactionDraftRequest & { method: 'sendTransaction' })
    | (SignDataPayload & { method: 'signData' })
    | (SignMessageDraftRequest & { method: 'signMessage' })
    | (SendActionDraftRequest & { method: 'sendAction' });

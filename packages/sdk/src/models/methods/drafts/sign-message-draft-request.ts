import { SendTransactionDraftItem } from './send-transaction-draft-request';
import { ChainId } from '@tonconnect/protocol';

export interface SignMessageDraftRequest {
    validUntil: number;
    network?: ChainId;
    items: SendTransactionDraftItem[];
}

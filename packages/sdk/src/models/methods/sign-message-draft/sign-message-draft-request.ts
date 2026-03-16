import { SendTransactionDraftItem } from '../send-transaction-draft';
import { ChainId } from '@tonconnect/protocol';

export interface SignMessageDraftRequest {
    validUntil: number;
    network?: ChainId;
    items: SendTransactionDraftItem[];
}

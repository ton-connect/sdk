import { SendTransactionIntentItem } from './send-transaction-intent-request';
import { ChainId } from '@tonconnect/protocol';

export interface SignMessageIntentRequest {
    validUntil: number;
    network?: ChainId;
    items: SendTransactionIntentItem[];
}

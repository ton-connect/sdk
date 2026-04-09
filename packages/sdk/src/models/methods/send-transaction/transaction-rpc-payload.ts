import { ChainId } from '@tonconnect/protocol';
import { RawStructuredItem } from './transaction-item';

export interface TransactionRpcPayloadBase {
    from: string;
    network: ChainId;
    valid_until: number;
}

export interface TransactionRpcPayloadWithMessages extends TransactionRpcPayloadBase {
    messages: Array<{
        address: string;
        amount: string;
        stateInit?: string;
        payload?: string;
        extra_currency?: { [k: number]: string };
    }>;
    items?: never;
}

export interface TransactionRpcPayloadWithItems extends TransactionRpcPayloadBase {
    items: RawStructuredItem[];
    messages?: never;
}

export type TransactionRpcPayload =
    | TransactionRpcPayloadWithMessages
    | TransactionRpcPayloadWithItems;

import { ChainId } from '@tonconnect/protocol';
import { StructuredItem } from './structured-item';

/**
 * Fields shared by both payload shapes of `sendTransaction` / `signMessage`.
 */
export interface SendTransactionRequestBase {
    /**
     * Deadline in unix epoch seconds. The wallet refuses the request after
     * this moment.
     */
    validUntil: number;

    /**
     * Target [TON network identifier](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#network_id).
     */
    network?: ChainId;

    /**
     * Sender address in raw `<workchain>:<hex>` format.
     *
     * @default {@link Account.address}.
     */
    from?: string;
}

/**
 * Send a transaction using the raw `messages[]` payload.
 *
 * @see [Send a transaction § Raw messages (docs)](https://docs.ton.org/applications/ton-connect/how-to/send-transaction#raw-messages)
 */
export interface SendTransactionRequestWithMessages extends SendTransactionRequestBase {
    /**
     * Outgoing messages — at least one, no more than the wallet's
     * {@link SendTransactionFeature.maxMessages} (declared in `Wallet.device.features`).
     *
     * Submission is grouped (one signed external) but execution is not atomic:
     * each recipient contract is processed independently, so some messages can
     * fail or bounce while others succeed.
     */
    messages: {
        /**
         * Destination address in [TEP-2](https://github.com/ton-blockchain/TEPs/blob/master/text/0002-address.md)
         * user-friendly base64url form. Wallets reject raw `0:<hex>` form.
         * The bounceable flag is taken from the address itself.
         */
        address: string;

        /** Nanocoins to send, as a decimal string. */
        amount: string;

        /**
         * Optional one-cell BoC `StateInit`, base64-encoded.
         */
        stateInit?: string;

        /** Optional one-cell BoC body, base64-encoded. */
        payload?: string;

        /**
         * Extra currencies to attach.
         */
        extraCurrency?: { [k: number]: string };
    }[];

    items?: never;
}

/**
 * Send a transaction using structured items. Use only when you
 * know the wallet advertises the needed {@link SendTransactionFeature.itemTypes}.
 *
 * @see {@link StructuredItem}
 * @see [Send a transaction § Structured items (docs)](https://docs.ton.org/applications/ton-connect/how-to/send-transaction#structured-items)
 */
export interface SendTransactionRequestWithItems extends SendTransactionRequestBase {
    /**
     * Structured items. The wallet builds the BoC for each.
     */
    items: StructuredItem[];

    messages?: never;
}

/**
 * Payload of `sendTransaction` method.
 *
 * @see [Send a transaction (docs)](https://docs.ton.org/applications/ton-connect/how-to/send-transaction)
 * @see [`sendTransaction` (RPC spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md#sendtransaction)
 */
export type SendTransactionRequest =
    | SendTransactionRequestWithMessages
    | SendTransactionRequestWithItems;

/** Type guard: narrows to {@link SendTransactionRequestWithItems}. */
export function hasItems(req: SendTransactionRequest): req is SendTransactionRequestWithItems {
    return 'items' in req && Array.isArray(req.items);
}

/** Type guard: narrows to {@link SendTransactionRequestWithMessages}. */
export function hasMessages(
    req: SendTransactionRequest
): req is SendTransactionRequestWithMessages {
    return 'messages' in req && Array.isArray(req.messages);
}

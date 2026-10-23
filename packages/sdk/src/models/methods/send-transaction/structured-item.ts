/**
 * Structured items describe **what** the transaction should do (send GRAM,
 * transfer a jetton, transfer an NFT) and let the wallet build the BoC.
 *
 * Wallets advertise structured-item support through the
 * {@link SendTransactionFeature.itemTypes} and {@link SignMessageFeature.itemTypes} features.
 *
 * @see [Send a transaction § Structured items (docs)](https://docs.ton.org/applications/ton-connect/how-to/send-transaction#structured-items)
 * @see [Structured items wallet guide](https://github.com/ton-blockchain/ton-connect/blob/main/guides/structured-items.md)
 */
export type StructuredItem = TonItem | JettonItem | NftItem;

/**
 * Native GRAM (formerly TON) transfer.
 */
export interface TonItem {
    type: 'ton';

    /**
     * Destination address in [TEP-2](https://github.com/ton-blockchain/TEPs/blob/master/text/0002-address.md)
     * user-friendly base64url form. The bounceable flag is taken from the
     * address itself.
     */
    address: string;

    /** Nanocoins to send, as a decimal string (e.g. `"5000000"` for 0.005 GRAM). */
    amount: string;

    /** Optional one-cell BoC body, base64-encoded. Omit for a plain transfer. */
    payload?: string;

    /**
     * Optional one-cell BoC `StateInit`, base64-encoded. Use it to deploy a
     * contract together with the value transfer.
     */
    stateInit?: string;

    /**
     * Extra currencies to attach: map of TEP-92 currency id (decimal integer
     * key) to amount in elementary units (decimal string value).
     */
    extraCurrency?: { [k: number]: string };
}

/**
 * [TEP-74](https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md)
 * jetton transfer. The wallet resolves the user's jetton-wallet address from
 * `master`, builds the transfer body and attaches enough GRAM to pay for the
 * jetton-wallet execution.
 */
export interface JettonItem {
    type: 'jetton';

    /** Jetton master contract address (friendly format). */
    master: string;

    /** Recipient address (friendly format). */
    destination: string;

    /** Jetton amount in elementary units. */
    amount: string;

    /**
     * Nanocoins of GRAM to attach to the jetton-wallet call.
     */
    attachAmount?: string;

    /** Where to refund excess GRAM. Defaults to the sender. */
    responseDestination?: string;

    /** Raw one-cell BoC `custom_payload`, base64-encoded. */
    customPayload?: string;

    /**
     * Nanocoins forwarded to the destination wallet — drives the
     * `transfer_notification` to the recipient. Defaults to `"1"` nanogram.
     */
    forwardAmount?: string;

    /** Raw one-cell BoC `forward_payload`, base64-encoded. */
    forwardPayload?: string;

    /** Application-defined `query_id` for the transfer body. */
    queryId?: string;
}

/**
 * [TEP-62](https://github.com/ton-blockchain/TEPs/blob/master/text/0062-nft-standard.md)
 * NFT transfer. The wallet builds the `transfer#5fcc3d14` body addressed to the
 * NFT item contract.
 */
export interface NftItem {
    type: 'nft';

    /** NFT item contract address (friendly format). */
    nftAddress: string;

    /** New owner address (friendly format). */
    newOwner: string;

    /**
     * Nanocoins of GRAM to attach.
     */
    attachAmount?: string;

    /** Where to refund excess GRAM. */
    responseDestination?: string;

    /** Raw one-cell BoC `custom_payload`, base64-encoded. */
    customPayload?: string;

    /** Nanocoins forwarded to the new owner. */
    forwardAmount?: string;

    /** Raw one-cell BoC `forward_payload`, base64-encoded. */
    forwardPayload?: string;

    /** Application-defined `query_id` for the transfer body. */
    queryId?: string;
}

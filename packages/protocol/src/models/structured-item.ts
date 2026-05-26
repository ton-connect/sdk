/**
 * Wire-format structured items used inside JSON-RPC payloads and embedded-request
 * expansion. These match the shape that travels over the bridge / URL — field
 * casing follows the protocol (e.g. `extra_currency` snake_case).
 *
 * The rich, user-facing counterparts (with camelCase fields and SDK-level
 * conveniences) live in `@tonconnect/sdk` as `StructuredItem`.
 *
 * @see [`sendTransaction` § Structured items (RPC spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md#sendtransaction)
 */
export type RpcStructuredItem = RpcTonItem | RpcJettonItem | RpcNftItem;

/** Native TON transfer in RPC wire form. */
export interface RpcTonItem {
    /** Item discriminator. */
    type: 'ton';
    /** Destination address in TEP-2 user-friendly format. */
    address: string;
    /** Nanocoins to send, as a decimal string. */
    amount: string;
    /** Optional one-cell BoC body, base64-encoded. */
    payload?: string;
    /** Optional one-cell BoC `StateInit`, base64-encoded. */
    stateInit?: string;
    /** TEP-92 extra currencies: `currency_id` → decimal amount string. */
    extra_currency?: { [k: number]: string };
}

/** [TEP-74](https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md) jetton transfer in RPC wire form. */
export interface RpcJettonItem {
    /** Item discriminator. */
    type: 'jetton';
    /** Jetton master contract address. */
    master: string;
    /** Recipient address. */
    destination: string;
    /** Jetton amount in elementary units (decimal string). */
    amount: string;
    /** TON value to attach for transfer execution; wallet picks a default when omitted. */
    attachAmount?: string;
    /** Where to refund excess TON. Defaults to the sender. */
    responseDestination?: string;
    /** Raw one-cell BoC `custom_payload`, base64-encoded. */
    customPayload?: string;
    /** Nanocoins forwarded to the destination wallet. Defaults to `"1"` nanoTON. */
    forwardAmount?: string;
    /** Raw one-cell BoC `forward_payload`, base64-encoded. */
    forwardPayload?: string;
    /** Application-defined `query_id` for the transfer body. */
    queryId?: string;
}

/** [TEP-62](https://github.com/ton-blockchain/TEPs/blob/master/text/0062-nft-standard.md) NFT transfer in RPC wire form. */
export interface RpcNftItem {
    /** Item discriminator. */
    type: 'nft';
    /** NFT item contract address. */
    nftAddress: string;
    /** New owner address. */
    newOwner: string;
    /** TON value to attach for transfer execution; wallet picks a default when omitted. */
    attachAmount?: string;
    /** Where to refund excess TON. Defaults to the sender. */
    responseDestination?: string;
    /** Raw one-cell BoC `custom_payload`, base64-encoded. */
    customPayload?: string;
    /** Nanocoins forwarded to the new owner. Defaults to `"1"` nanoTON. */
    forwardAmount?: string;
    /** Raw one-cell BoC `forward_payload`, base64-encoded. */
    forwardPayload?: string;
    /** Application-defined `query_id` for the transfer body. */
    queryId?: string;
}

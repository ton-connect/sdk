export type StructuredItem = TonItem | JettonItem | NftItem;

/** Snake_case wire-format items sent in the JSON-RPC payload. */
export type RawStructuredItem = RawTonItem | RawJettonItem | RawNftItem;

export interface RawTonItem {
    type: 'ton';
    address: string;
    amount: string;
    payload?: string;
    state_init?: string;
    extra_currency?: { [k: number]: string };
}

export interface RawJettonItem {
    type: 'jetton';
    master: string;
    destination: string;
    amount: string;
    attach_amount?: string;
    response_destination?: string;
    custom_payload?: string;
    forward_amount?: string;
    forward_payload?: string;
}

export interface RawNftItem {
    type: 'nft';
    nft_address: string;
    new_owner: string;
    attach_amount?: string;
    response_destination?: string;
    custom_payload?: string;
    forward_amount?: string;
    forward_payload?: string;
}

export interface TonItem {
    type: 'ton';

    /** Destination address in friendly format. */
    address: string;

    /** Amount in nanocoins as decimal string. */
    amount: string;

    /** Raw one-cell BoC encoded in Base64. */
    payload?: string;

    /** Raw one-cell BoC encoded in Base64. */
    stateInit?: string;

    /** Extra currencies to send. */
    extraCurrency?: { [k: number]: string };
}

export interface JettonItem {
    type: 'jetton';

    /** Jetton master contract address. */
    master: string;

    /** Recipient address. */
    destination: string;

    /** Jetton amount in elementary units. */
    amount: string;

    /** TON to attach for fees; wallet calculates if omitted. */
    attachAmount?: string;

    /** Where to send excess; defaults to sender. */
    responseDestination?: string;

    /** Raw one-cell BoC encoded in Base64. */
    customPayload?: string;

    /** Nanotons to forward to destination. */
    forwardAmount?: string;

    /** Raw one-cell BoC encoded in Base64. */
    forwardPayload?: string;
}

export interface NftItem {
    type: 'nft';

    /** NFT item contract address. */
    nftAddress: string;

    /** Address of the new owner. */
    newOwner: string;

    /** TON to attach for fees; wallet calculates if omitted. */
    attachAmount?: string;

    /** Where to send excess; defaults to sender. */
    responseDestination?: string;

    /** Raw one-cell BoC encoded in Base64. */
    customPayload?: string;

    /** Nanotons to forward to destination. */
    forwardAmount?: string;

    /** Raw one-cell BoC encoded in Base64. */
    forwardPayload?: string;
}

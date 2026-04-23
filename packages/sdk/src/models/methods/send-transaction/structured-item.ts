export type StructuredItem = TonItem | JettonItem | NftItem;

export interface TonItem {
    type: 'ton';

    /** Destination address in friendly format. */
    address: string;

    /** Amount in nanocoins as string. */
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

    /** Custom query ID for the transfer. */
    queryId?: string;
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

    /** Custom query ID for the transfer. */
    queryId?: string;
}

export interface SendTonItem {
    /** Item type discriminator. */
    t: 'ton';

    /** Message destination in user-friendly format. */
    a: string;

    /** Number of nanocoins to send as a decimal string. */
    am: string;

    /** Raw one-cell BoC encoded in Base64. */
    p?: string;

    /** Raw one-cell BoC encoded in Base64 (state init). */
    si?: string;

    /** Extra currencies to send with the message. */
    ec?: { [k: number]: string };
}

export interface SendJettonItem {
    /** Item type discriminator. */
    t: 'jetton';

    /** Jetton master contract address. */
    ma: string;

    /** Arbitrary request number. */
    qi?: number;

    /** Amount of transferring jettons in elementary units. */
    ja: string;

    /** Address of the new owner of the jettons. */
    d: string;

    /** Optional amount of TON (nanocoins) to attach for fees. If omitted, wallet MUST calculate this field. */
    am?: string;

    /**
     * Address where to send a response with confirmation of a successful transfer
     * and the rest of the incoming message Toncoins. If omitted, user's address MUST be used.
     */
    rd?: string;

    /** Raw one-cell BoC encoded in Base64 custom data (used by either sender or receiver jetton wallet for inner logic). */
    cp?: string;

    /** Amount of nanotons to be sent to the destination address. */
    fta?: string;

    /** Base64-encoded custom data that should be sent to the destination address with notification. */
    fp?: string;
}

export interface SendNftItem {
    /** Item type discriminator. */
    t: 'nft';

    /** Address of the NFT item to transfer. */
    na: string;

    /** Arbitrary request number. */
    qi?: number;

    /** Address of the new owner of the NFT item. */
    no: string;

    /** Optional amount of TON (nanocoins) to attach for fees. If omitted, wallet MUST calculate this field. */
    am?: string;

    /**
     * Address where to send a response with confirmation of a successful transfer
     * and the rest of the incoming message Toncoins. If omitted, user's address MUST be used.
     */
    rd?: string;

    /** Raw one-cell BoC encoded in Base64 custom data (used by either sender or receiver NFT wallet for inner logic). */
    cp?: string;

    /** Amount of nanotons to be sent to the destination address. */
    fta?: string;

    /** Base64-encoded custom data that should be sent to the destination address with notification. */
    fp?: string;
}

export type TransactionDraftItem = SendTonItem | SendJettonItem | SendNftItem;

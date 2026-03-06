export interface SendTonItem {
    /**
     * Item type discriminator. Must be set to `ton`.
     */
    t: 'ton';

    /**
     * Destination address in `<wc>:<hex>` format.
     */
    a: string;

    /**
     * Amount to send in nanoTON.
     */
    am: string;

    /**
     * Optional payload (base64-encoded BOC).
     */
    p?: string;

    /**
     * Optional contract state init (base64-encoded BOC).
     */
    si?: string;

    /**
     * Optional map of extra currencies to send.
     * Keys are currency IDs, values are string-encoded amounts.
     */
    ec?: Record<string, string>;
}

export interface SendJettonItem {
    /**
     * Item type discriminator. Must be set to `jetton`.
     */
    t: 'jetton';

    /**
     * Jetton master contract address.
     */
    ma: string;

    /**
     * Optional query id.
     */
    qi?: number;

    /**
     * Jetton destination address.
     */
    ja: string;

    /**
     * Jetton transfer payload (base64-encoded BOC).
     */
    d: string;

    /**
     * Optional attached TON amount in nanoTON.
     */
    am?: string;

    /**
     * Optional response destination address.
     */
    rd?: string;

    /**
     * Optional custom payload (base64-encoded BOC).
     */
    cp?: string;

    /**
     * Optional forward TON amount in nanoTON.
     */
    fta?: string;

    /**
     * Optional forward payload (base64-encoded BOC).
     */
    fp?: string;
}

export interface SendNftItem {
    /**
     * Item type discriminator. Must be set to `nft`.
     */
    t: 'nft';

    /**
     * NFT item address.
     */
    na: string;

    /**
     * Optional query id.
     */
    qi?: number;

    /**
     * New NFT owner address.
     */
    no: string;

    /**
     * Optional attached TON amount in nanoTON.
     */
    am?: string;

    /**
     * Optional response destination address.
     */
    rd?: string;

    /**
     * Optional custom payload (base64-encoded BOC).
     */
    cp?: string;

    /**
     * Optional forward TON amount in nanoTON.
     */
    fta?: string;

    /**
     * Optional forward payload (base64-encoded BOC).
     */
    fp?: string;
}

export type IntentItem = SendTonItem | SendJettonItem | SendNftItem;

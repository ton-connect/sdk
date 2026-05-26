/**
 * Capability entries advertised by a wallet inside {@link DeviceInfo.features}.
 *
 * @see [`Feature` (Connect spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#feature)
 */
export type Feature =
    | SendTransactionFeatureDeprecated
    | SendTransactionFeature
    | SignDataFeature
    | SignMessageFeature
    | EmbeddedRequestFeature;

export type FeatureName = Exclude<Feature, 'SendTransaction'>['name'];

export type SendTransactionFeatureDeprecated = 'SendTransaction';

/**
 * Item kinds a wallet may accept inside `sendTransaction.items` /
 * `signMessage.items`. Maps to the structured wallet-built transfers:
 * native TON, [TEP-74](https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md) jetton,
 * [TEP-62](https://github.com/ton-blockchain/TEPs/blob/master/text/0062-nft-standard.md) NFT.
 */
export type StructuredItemType = 'ton' | 'jetton' | 'nft';

export type SendTransactionFeature = {
    name: 'SendTransaction';
    /**
     * Maximum number of messages the wallet accepts in a single request.
     */
    maxMessages: number;

    /**
     * `true` if the wallet can attach extra currencies. Absent or
     * `false` means extra currencies are unsupported.
     */
    extraCurrencySupported?: boolean;

    /**
     * Structured-item kinds the wallet accepts inside `items[]`. Absent means
     * only raw `messages[]` are supported.
     */
    itemTypes?: StructuredItemType[];
};

export type SignDataType = 'text' | 'binary' | 'cell';

export type SignDataFeature = { name: 'SignData'; types: SignDataType[] };

export type SignMessageFeature = {
    name: 'SignMessage';
    /**
     * Maximum number of messages the wallet will accept inside a single
     * `signMessage` request.
     */
    maxMessages: number;

    /** `true` if extra currencies are supported in the signed message. */
    extraCurrencySupported?: boolean;

    /**
     * Structured-item kinds the wallet accepts. Absent means only raw
     * `messages[]` are supported.
     */
    itemTypes?: StructuredItemType[];
};

/**
 * Wallet supports the embedded-request transport (`e` query parameter on the
 * connect URL).
 *
 * @see [Embedded requests (deeplinks spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/deeplinks.md#embedded-requests-e)
 */
export type EmbeddedRequestFeature = { name: 'EmbeddedRequest' };

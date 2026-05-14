/**
 * Single entry from the wallet's advertised `features` array in
 * {@link DeviceInfo}. Each variant tells the app what the wallet can do —
 * which RPC methods it accepts, which structured item types and which
 * sign-data payload shapes it supports.
 */
export type Feature =
    | SendTransactionFeatureDeprecated
    | SendTransactionFeature
    | SignDataFeature
    | SignMessageFeature
    | EmbeddedRequestFeature;

/**
 * Discriminator values for the object-form feature variants — i.e. every
 * {@link Feature} except the legacy string {@link SendTransactionFeatureDeprecated}.
 */
export type FeatureName = Exclude<Feature, 'SendTransaction'>['name'];

/**
 * Legacy string form of the send-transaction feature emitted by older wallets.
 * Modern wallets emit the object {@link SendTransactionFeature} instead.
 */
export type SendTransactionFeatureDeprecated = 'SendTransaction';

/**
 * Kind of {@link RpcStructuredItem} a wallet can handle inside a
 * `sendTransaction` or `signMessage` payload.
 *
 * - `ton` — native TON transfer.
 * - `jetton` — jetton transfer (TEP-74).
 * - `nft` — NFT transfer (TEP-62).
 */
export type StructuredItemType = 'ton' | 'jetton' | 'nft';

/**
 * Object form of the send-transaction feature. Replaces the legacy string
 * {@link SendTransactionFeatureDeprecated} and carries the wallet's per-call
 * limits.
 */
export type SendTransactionFeature = {
    /** Feature discriminator. */
    name: 'SendTransaction';
    /** Maximum number of messages the wallet accepts in one `sendTransaction`. */
    maxMessages: number;
    /** `true` when the wallet supports `extra_currency` on messages. */
    extraCurrencySupported?: boolean;
    /**
     * Supported structured item types. Absent means the wallet accepts only
     * raw `messages` (no `items`).
     */
    itemTypes?: StructuredItemType[];
};

/**
 * Payload shape accepted by the `signData` RPC method (see
 * {@link SignDataPayload}).
 */
export type SignDataType = 'text' | 'binary' | 'cell';

/**
 * Wallet supports the `signData` RPC method for the listed payload `types`.
 */
export type SignDataFeature = {
    /** Feature discriminator. */
    name: 'SignData';
    /** Payload shapes the wallet can sign — any subset of `text`, `binary`, `cell`. */
    types: SignDataType[];
};

/**
 * Wallet supports the `signMessage` RPC method. Same per-call shape as
 * {@link SendTransactionFeature}; only the discriminator differs.
 */
export type SignMessageFeature = {
    /** Feature discriminator. */
    name: 'SignMessage';
    /** Maximum number of messages the wallet accepts in one `signMessage`. */
    maxMessages: number;
    /** `true` when the wallet supports `extra_currency` on messages. */
    extraCurrencySupported?: boolean;
    /**
     * Supported structured item types. Absent means the wallet accepts only
     * raw `messages` (no `items`).
     */
    itemTypes?: StructuredItemType[];
};

/**
 * Wallet recognises and processes the `e` parameter from the connect URL —
 * see {@link decodeEmbeddedRequestParam} and the bridge spec's
 * "Embedded requests" section. Wallets without this feature silently ignore
 * the parameter.
 */
export type EmbeddedRequestFeature = {
    /** Feature discriminator. */
    name: 'EmbeddedRequest';
};

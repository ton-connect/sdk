import { SignDataType, StructuredItemType } from '@tonconnect/protocol';

/**
 * Wallet capabilities the dApp depends on.
 *
 * Top-level keys combine as a logical AND — declaring `sendTransaction` and
 * `signMessage` requires both. A wallet matches when every requirement listed
 * appears in its {@link DeviceInfo.features}.
 *
 * @see [Filter wallets by required features (docs)](https://docs.ton.org/applications/ton-connect/how-to/filter-wallets)
 * @see [`Feature` (Connect spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#feature)
 */
export type RequiredFeatures = {
    /**
     * Constraints on the wallet's `SendTransaction` feature.
     */
    sendTransaction?: RequiredSendTransactionFeature;

    /**
     * Constraints on the wallet's `SignData` feature.
     */
    signData?: RequiredSignDataFeature;

    /**
     * Constraints on the wallet's `SignMessage` feature.
     */
    signMessage?: RequiredSignMessageFeature;

    /**
     * Require support for the embedded-request transport. The entry takes no
     * parameters: pass `{}`.
     */
    embeddedRequest?: RequiredEmbeddedRequestFeature;
};

/**
 * Filter for the wallet's [`SendTransaction`](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#feature)
 * capability.
 */
export type RequiredSendTransactionFeature = {
    /**
     * Wallet's `maxMessages` must be greater than or equal to this value.
     */
    minMessages?: number;

    /**
     * Require `extraCurrencySupported: true` on the wallet's `SendTransaction`
     * feature.
     */
    extraCurrencyRequired?: boolean;

    /**
     * Every requested type must appear in the wallet's `itemTypes`. Use when
     * the dApp will send a {@link SendTransactionRequestWithItems}
     * request relying on `ton`, `jetton` or `nft` items.
     */
    itemTypes?: StructuredItemType[];
};

/**
 * Filter for the wallet's [`SignData`](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#feature)
 * capability.
 */
export type RequiredSignDataFeature = {
    /**
     * Every requested payload type must appear in the wallet's `types` list.
     * One of `'text'`, `'binary'`, `'cell'`.
     */
    types: SignDataType[];
};

/**
 * Filter for the wallet's [`SignMessage`](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#feature)
 * capability. Same shape as {@link RequiredSendTransactionFeature}; checked
 * against the wallet's `SignMessage` feature entry.
 */
export type RequiredSignMessageFeature = {
    /** Wallet's `maxMessages` must be greater than or equal to this value. */
    minMessages?: number;

    /** Require `extraCurrencySupported: true` on the `SignMessage` feature. */
    extraCurrencyRequired?: boolean;

    /** Every requested type must appear in the wallet's `SignMessage.itemTypes`. */
    itemTypes?: StructuredItemType[];
};

/**
 * Marker filter for the wallet's
 * [`EmbeddedRequest`](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#feature)
 * feature. The feature itself has no parameters; pass `{}` to require it.
 */
export type RequiredEmbeddedRequestFeature = {};

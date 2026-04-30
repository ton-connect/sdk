import { SignDataType, StructuredItemType } from '@tonconnect/protocol';

/**
 * Required features for wallets.
 */
export type RequiredFeatures = {
    /**
     * Required features for the send transaction feature.
     */
    sendTransaction?: RequiredSendTransactionFeature;
    signData?: RequiredSignDataFeature;
    signMessage?: RequiredSignMessageFeature;
    embeddedRequest?: RequiredEmbeddedRequestFeature;
};

/**
 * Required features for the send transaction feature.
 */
export type RequiredSendTransactionFeature = {
    /**
     * Minimum number of messages to send.
     */
    minMessages?: number;

    /**
     * Whether extra currency is required.
     */
    extraCurrencyRequired?: boolean;

    /**
     * Required item types (ton, jetton, nft).
     */
    itemTypes?: StructuredItemType[];
};

/**
 * Required features for the sign data feature.
 */
export type RequiredSignDataFeature = {
    /**
     * Supported sign data types.
     */
    types: SignDataType[];
};

/**
 * Required features for the sign message feature.
 */
export type RequiredSignMessageFeature = {
    /**
     * Minimum number of messages to sign.
     */
    minMessages?: number;

    /**
     * Whether extra currency is required.
     */
    extraCurrencyRequired?: boolean;

    /**
     * Required item types (ton, jetton, nft).
     */
    itemTypes?: StructuredItemType[];
};

/**
 * Required features for the embedded request feature.
 */
export type RequiredEmbeddedRequestFeature = {};

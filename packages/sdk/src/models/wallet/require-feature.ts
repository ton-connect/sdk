import { SignDataType } from '@tonconnect/protocol';

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
};

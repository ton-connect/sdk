import { IntentMethodType, SignDataType } from '@tonconnect/protocol';

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
    sendTransactionDraft?: RequiredSendTransactionDraftFeature;
    signDataDraft?: RequiredSignDataDraftFeature;
    signMessageDraft?: RequiredSignMessageDraftFeature;
    sendActionDraft?: RequiredSendActionDraftFeature;
    /**
     * Required support for drafts.
     */
    intents?: RequiredIntentsFeature;
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

/**
 * Required features for the send transaction draft feature.
 */
export type RequiredSendTransactionDraftFeature = RequiredSendTransactionFeature;

/**
 * Required features for the sign data draft feature.
 */
export type RequiredSignDataDraftFeature = RequiredSignDataFeature;

/**
 * Required features for the sign message draft feature.
 */
export type RequiredSignMessageDraftFeature = RequiredSignMessageFeature;

/**
 * Required features for the send action draft feature.
 */
export type RequiredSendActionDraftFeature = Record<string, never>;

/**
 * Required support for Drafts feature.
 */
export type RequiredIntentsFeature = {
    /**
     * Draft types that must be supported via Intents feature.
     */
    types: IntentMethodType[];
};

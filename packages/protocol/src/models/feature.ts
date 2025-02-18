export type Feature = SendTransactionFeatureDeprecated | SendTransactionFeature | SignDataFeature;

export type SendTransactionFeatureDeprecated = 'SendTransaction';
export type SendTransactionFeature = {
    name: 'SendTransaction';
    maxMessages: number;
    extraCurrencySupported?: boolean;
};
export type SignDataFeature = { name: 'SignData' };

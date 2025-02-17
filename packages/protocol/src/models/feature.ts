export type Feature = SendTransactionFeatureDeprecated | SendTransactionFeature | SignDataFeature;

export type SendTransactionFeatureDeprecated = 'SendTransaction';
export type SendTransactionFeature = {
    name: 'SendTransaction';
    maxMessages: number;
    extraCurrenciesSupported?: boolean;
};
export type SignDataFeature = { name: 'SignData' };

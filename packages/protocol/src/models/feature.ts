export type Feature = SendTransactionFeatureDeprecated | SendTransactionFeature | SignDataFeature;
export type FeatureWithName = Exclude<Feature, SendTransactionFeatureDeprecated>;

export type SendTransactionFeatureDeprecated = 'SendTransaction';
export type SendTransactionFeature = {
    name: 'SendTransaction';
    maxMessages: number;
    supportsExtraCurrencies?: boolean;
};
export type SignDataFeature = { name: 'SignData' };

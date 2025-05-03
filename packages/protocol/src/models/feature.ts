export type Feature = SendTransactionFeatureDeprecated | SendTransactionFeature | SignDataFeature;
export type FeatureName = Exclude<Feature, 'SendTransaction'>['name'];

export type SendTransactionFeatureDeprecated = 'SendTransaction';
export type SendTransactionFeature = {
    name: 'SendTransaction';
    maxMessages: number;
    extraCurrencySupported?: boolean;
};

export type SignDataType = 'text' | 'binary' | 'cell';
export type SignDataFeature = { name: 'SignData'; types: SignDataType[] };

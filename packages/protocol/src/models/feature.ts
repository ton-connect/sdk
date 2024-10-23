export type Feature = SendTransactionFeatureDeprecated | SendTransactionFeature | SignDataFeature | SignDataFeatureDeprecated;

export type SendTransactionFeatureDeprecated = 'SendTransaction';
export type SendTransactionFeature = { name: 'SendTransaction'; maxMessages: number };
export type SignDataFeatureDeprecated = 'SignData';
export type SignDataFeature = { name: 'SignData' };

export type Feature = SendTransactionFeatureDeprecated | SendTransactionFeature | SignDataFeature | EncryptDataFeature | DecryptDataFeature;

export type SendTransactionFeatureDeprecated = 'SendTransaction';
export type SendTransactionFeature = { name: 'SendTransaction'; maxMessages: number };
export type SignDataFeature = { name: 'SignData' };

export type EncryptDataFeature = {name: 'EncryptData'};
export type DecryptDataFeature = {name: 'DecryptData'}
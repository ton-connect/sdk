export declare type Feature = SendTransactionFeatureDeprecated | SendTransactionFeature | SignDataFeature | EncryptDataFeature | DecryptDataFeature;
export declare type SendTransactionFeatureDeprecated = 'SendTransaction';
export declare type SendTransactionFeature = {
    name: 'SendTransaction';
    maxMessages: number;
};
export declare type SignDataFeature = {
    name: 'SignData';
};
export declare type EncryptDataFeature = {
    name: 'EncryptData';
};
export declare type DecryptDataFeature = {
    name: 'DecryptData';
};

export type Feature =
    | SendTransactionFeatureDeprecated
    | SendTransactionFeature
    | SignDataFeature
    | SignMessageFeature
    | SendTransactionDraftFeature
    | SignMessageDraftFeature
    | ActionDraftFeature
    | IntentsFeature;

export type FeatureName = Exclude<Feature, 'SendTransaction'>['name'];

export type SendTransactionFeatureDeprecated = 'SendTransaction';

export type SendTransactionFeature = {
    name: 'SendTransaction';
    maxMessages: number;
    extraCurrencySupported?: boolean;
};

export type SignDataType = 'text' | 'binary' | 'cell';

export type SignDataFeature = { name: 'SignData'; types: SignDataType[] };

export type SignMessageFeature = {
    name: 'SignMessage';
};

export type DraftAssetType = 'ton' | 'jetton' | 'nft';

export type SendTransactionDraftFeature = {
    name: 'SendTransactionDraft';
    types: DraftAssetType[];
};

export type SignMessageDraftFeature = {
    name: 'SignMessageDraft';
    types: DraftAssetType[];
};

export type ActionDraftFeature = {
    name: 'ActionDraft';
};

export type IntentMethodType = 'txDraft' | 'signMsgDraft' | 'actionDraft' | 'signData';

export type IntentsFeature = {
    name: 'Intents';
    types: IntentMethodType[];
};

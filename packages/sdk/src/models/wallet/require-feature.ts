export type RequireFeature = RequireSendTransactionFeature | RequireSignDataFeature

export type RequireSendTransactionFeature = {
    name: 'SendTransaction';
    minMessages?: number;
    extraCurrencyRequired?: boolean;
};

export type RequireSignDataFeature = {
    name: 'SignData';
};

export type RequireFeature = RequireSendTransactionFeature;

export type RequireSendTransactionFeature = {
    name: 'SendTransaction';
    minMessages?: number;
    extraCurrencyRequired?: boolean;
};

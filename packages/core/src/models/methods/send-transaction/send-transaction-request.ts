export interface SendTransactionRequest {
    valid_until: number;
    messages: {
        address: string;
        amount: string;
        initState?: string;
        payload?: string;
    }[];
}

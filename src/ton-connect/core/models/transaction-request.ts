export interface TransactionRequest {
    deadline: number;
    sendMode: number;
    to: string;
    value: string;
    bounce: boolean;
    stateInit: string;
    body: string;
}

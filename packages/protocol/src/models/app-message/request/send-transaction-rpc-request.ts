export interface SendTransactionRpcRequest {
    method: 'sendTransaction';
    params: [string];
    id: string;
}

export interface SignMessageRpcRequest {
    method: 'signMessage';
    params: [string];
    id: string;
}

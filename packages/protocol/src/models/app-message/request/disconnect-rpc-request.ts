/**
 * RPC request that tells the wallet the dApp ended the session.
 *
 * @see [`disconnect` (RPC spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md#disconnect)
 */
export interface DisconnectRpcRequest {
    method: 'disconnect';
    /** empty tuple — no parameters */
    params: [];
    /** dApp-assigned request id; used to match the wallet response */
    id: string;
}

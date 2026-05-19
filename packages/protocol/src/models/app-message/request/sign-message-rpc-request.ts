/**
 * RPC request to sign an internal message **without** broadcasting it.
 *
 * `params[0]` is a JSON-stringified payload identical in shape to
 * {@link SendTransactionRpcRequest}.
 *
 * @see [`signMessage` (RPC spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md#signmessage)
 */
export interface SignMessageRpcRequest {
    method: 'signMessage';
    /** single-element tuple: the JSON-stringified payload */
    params: [string];
    /** dApp-assigned request id; used to match the wallet response */
    id: string;
}

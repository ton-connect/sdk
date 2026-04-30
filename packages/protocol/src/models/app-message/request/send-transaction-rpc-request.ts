/**
 * RPC request to submit and broadcast a transaction.
 *
 * `params[0]` is a JSON-stringified payload that mirrors the SDK's
 * `SendTransactionRequest` (either raw `messages` OR structured `items`,
 * plus `valid_until`, `network`, and `from`).
 */
export interface SendTransactionRpcRequest {
    /** method discriminator */
    method: 'sendTransaction';
    /** single-element tuple: the JSON-stringified transaction payload */
    params: [string];
    /** dApp-assigned request id; used to match the wallet response */
    id: string;
}

/**
 * Result of `sendTransaction` method.
 *
 * @see [`sendTransaction` response (RPC spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md#sendtransaction)
 */
export interface SendTransactionResponse {
    /**
     * Base64-encoded BoC of the broadcasted external message.
     */
    boc: string;
}

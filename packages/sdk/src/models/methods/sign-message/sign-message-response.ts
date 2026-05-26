/**
 * Result of `signMessage` method.
 *
 *
 * @see [Sign and relay a message (gasless) (docs)](https://docs.ton.org/applications/ton-connect/how-to/sign-message-gasless)
 * @see [`signMessage` response (RPC spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md#signmessage)
 */
export interface SignMessageResponse {
    /**
     * Base64-encoded BoC of the signed internal message. The wallet does
     * **not** broadcast. Submit it through a relayer.
     */
    internalBoc: string;
}

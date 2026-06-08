/**
 * Extra items to attach to the [`ConnectRequest`](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#connectrequest)
 * the SDK sends to the wallet.
 *
 * @see [Connect a wallet § Authenticate with `ton_proof`](https://docs.ton.org/applications/ton-connect/how-to/connect#authenticate-with-ton_proof)
 * @see [Address proof signature (Connect spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#address-proof-signature-ton_proof)
 */
export interface ConnectAdditionalRequest {
    /**
     * Application payload for future verification to bind into the `ton_proof` signature.
     */
    tonProof?: string;
}

/**
 * RPC request asking the wallet to sign one or more internal messages
 * **without** broadcasting them. The wallet returns a signed BoC that the
 * app can submit later (deferred submission).
 *
 * The payload shape mirrors {@link SendTransactionRpcRequest} — see the
 * `signMessage` section of the requests-responses spec.
 */
export interface SignMessageRpcRequest {
    /** Method discriminator. */
    method: 'signMessage';
    /** Single-element tuple: the JSON-stringified sign-message payload. */
    params: [string];
    /** dApp-assigned request id; used to match the wallet response. */
    id: string;
}

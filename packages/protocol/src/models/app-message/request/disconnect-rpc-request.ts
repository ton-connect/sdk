/**
 * RPC request asking the wallet to tear down the current session.
 *
 * Sent when the user disconnects on the dApp side so the wallet can free
 * resources and update its UI. The wallet does **not** emit a
 * {@link DisconnectEvent} in response.
 */
export interface DisconnectRpcRequest {
    /** Method discriminator. */
    method: 'disconnect';
    /** No parameters — always the empty tuple. */
    params: [];
    /** dApp-assigned request id; used to match the wallet response. */
    id: string;
}

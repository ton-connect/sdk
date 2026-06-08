/**
 * Wallet-initiated session teardown. Fires when the user removes the dApp
 * from the wallet's connected-apps list.
 *
 * @see [Disconnect event (RPC spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md#disconnect-event)
 */
export interface DisconnectEvent {
    event: 'disconnect';
    /** Monotonic event id (separate counter from RPC `id`). */
    id: number;
    /** Empty for `disconnect`. */
    payload: {};
}

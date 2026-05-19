import { ConnectEvent } from './connect-event';
import { DisconnectEvent } from './disconnect-event';

/**
 * Server-initiated events the wallet emits to the dApp.
 *
 * - {@link ConnectEvent} — `connect` success or `connect_error`. Emitted
 *   in response to a `ConnectRequest`.
 * - {@link DisconnectEvent} — wallet-initiated session teardown.
 *
 * @see [Wallet events (RPC spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md#wallet-events)
 */
export type WalletEvent = ConnectEvent | DisconnectEvent;

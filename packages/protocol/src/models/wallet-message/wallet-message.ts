import { RpcMethod } from '../rpc-method';
import { WalletEvent } from './wallet-event';
import { WalletResponse } from './wallet-response';

/**
 * Anything a wallet can send to an app over the bridge: a {@link WalletEvent}
 * (lifecycle notification such as `connect` / `disconnect`) or a
 * {@link WalletResponse} (reply to an earlier {@link AppRequest}).
 */
export type WalletMessage = WalletEvent | WalletResponse<RpcMethod>;

import { RpcMethod } from '../rpc-method';
import { WalletEvent } from './wallet-event';
import { WalletResponse } from './wallet-response';

/**
 * Anything a wallet can send to a dApp over the protocol.
 */
export type WalletMessage = WalletEvent | WalletResponse<RpcMethod>;

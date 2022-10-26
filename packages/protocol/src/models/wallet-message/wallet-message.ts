import { RpcMethod } from '../rpc-method';
import { WalletEvent } from './wallet-event';
import { WalletResponse } from './wallet-response';

export type WalletMessage = WalletEvent | WalletResponse<RpcMethod>;

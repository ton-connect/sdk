import { RpcMethod } from 'src/models/protocol/rpc-method';
import { WalletEvent } from 'src/models/protocol/wallet-message/wallet-event';
import { WalletResponse } from 'src/models/protocol/wallet-message/wallet-response';

export type WalletMessage = WalletEvent | WalletResponse<RpcMethod>;

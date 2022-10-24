import { RpcMethod } from 'src/models/protocol/rpc-method';
import { SendTransactionResponse } from './send-transaction-response';

export type RpcResponses = {
    sendTransaction: SendTransactionResponse;
};

export type WalletResponse<T extends RpcMethod> = RpcResponses[T];

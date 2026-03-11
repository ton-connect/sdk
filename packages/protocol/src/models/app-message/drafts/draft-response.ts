import {
    SendTransactionRpcResponse,
    SignDataRpcResponse,
    SignMessageRpcResponse
} from '../../wallet-message';

export type DraftRpcResponse =
    | SendTransactionRpcResponse
    | SignDataRpcResponse
    | SignMessageRpcResponse;

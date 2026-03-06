import {
    SendTransactionRpcResponse,
    SignDataRpcResponse,
    SignMessageRpcResponse
} from '../../wallet-message';

export type IntentResponse =
    | SendTransactionRpcResponse
    | SignDataRpcResponse
    | SignMessageRpcResponse;

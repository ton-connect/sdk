import type {
    SendTransactionRpcRequest,
    SignDataRpcRequest,
    ConnectRequest
} from '@tonconnect/protocol';
import type { SendTransactionRequest, SignDataResponse, Wallet } from '@tonconnect/sdk';

export type EvalContext = {
    sendTransactionRpcRequest?: SendTransactionRpcRequest;
    signDataRpcRequest?: SignDataRpcRequest;
    connectRequest?: ConnectRequest;
    connectResponse?: Record<string, unknown>;
    wallet?: Wallet | null;
    sendTransactionParams?: SendTransactionRequest;
    signDataResponse?: SignDataResponse;
} | null;

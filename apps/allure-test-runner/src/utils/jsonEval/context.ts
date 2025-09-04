import type {
    ConnectEvent,
    SendTransactionRpcRequest,
    SignDataRpcRequest
} from '@tonconnect/protocol';
import type { SendTransactionRequest, SignDataResponse, Wallet } from '@tonconnect/sdk';

export type EvalContext = {
    sendTransactionRpcRequest?: SendTransactionRpcRequest;
    signDataRpcRequest?: SignDataRpcRequest;
    connectResponse?: ConnectEvent;
    wallet?: Wallet | null;
    sendTransactionParams?: SendTransactionRequest;
    signDataResponse?: SignDataResponse;
    tonProof?: string;
} | null;

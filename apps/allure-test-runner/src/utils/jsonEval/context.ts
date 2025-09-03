import type { SendTransactionRpcRequest, SignDataRpcRequest } from '@tonconnect/protocol';
import type { SendTransactionRequest, SignDataResponse, Wallet } from '@tonconnect/sdk';

export type EvalContext = {
    sendTransactionRpcRequest?: SendTransactionRpcRequest;
    signDataRpcRequest?: SignDataRpcRequest;
    wallet?: Wallet | null;
    sendTransactionParams?: SendTransactionRequest;
    signDataResponse?: SignDataResponse;
} | null;

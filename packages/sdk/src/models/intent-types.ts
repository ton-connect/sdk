import type { SendTransactionResponse, SignDataResponse, SignMessageResponse } from './methods';
import type {
    WalletConnectionSource,
    WalletConnectionSourceHTTP,
    WalletConnectionSourceJS,
    WalletConnectionSourceWalletConnect
} from './wallet';
import { RpcMethod, WalletResponseError } from '@tonconnect/protocol';

export type IntentRpcMethod = Extract<
    RpcMethod,
    'signData' | 'txDraft' | 'signMsgDraft' | 'actionDraft'
>;

export type IntentResponseError = WalletResponseError<IntentRpcMethod>;
export type IntentResponse =
    | SendTransactionResponse
    | SignDataResponse
    | SignMessageResponse
    | IntentResponseError;

export type WalletSourceArg =
    | WalletConnectionSource
    | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[];

export type WalletIntentResult<T extends WalletSourceArg> = T extends WalletConnectionSourceJS
    ? void
    : T extends WalletConnectionSourceWalletConnect
      ? void
      : string;

import type { SendTransactionResponse, SignDataResponse, SignMessageResponse } from './methods';
import type {
    WalletConnectionSource,
    WalletConnectionSourceHTTP,
    WalletConnectionSourceJS,
    WalletConnectionSourceWalletConnect
} from './wallet';
import type { WalletResponseError, IntentRpcMethod } from '@tonconnect/protocol';

export type IntentResponse =
    | SendTransactionResponse
    | SignDataResponse
    | SignMessageResponse
    | WalletResponseError<IntentRpcMethod>;

export type WalletSourceArg =
    | WalletConnectionSource
    | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[];

export type WalletIntentResult<T extends WalletSourceArg> = T extends WalletConnectionSourceJS
    ? void
    : T extends WalletConnectionSourceWalletConnect
      ? void
      : string;

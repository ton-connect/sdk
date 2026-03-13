import type { SendTransactionResponse, SignDataResponse, SignMessageResponse } from './methods';
import type {
    WalletConnectionSource,
    WalletConnectionSourceHTTP,
    WalletConnectionSourceJS,
    WalletConnectionSourceWalletConnect
} from './wallet';

export type IntentResponse = SendTransactionResponse | SignDataResponse | SignMessageResponse;

export type WalletSourceArg =
    | WalletConnectionSource
    | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[];

export type WaleltIntentResult<T extends WalletSourceArg> = T extends WalletConnectionSourceJS
    ? void
    : T extends WalletConnectionSourceWalletConnect
      ? void
      : string;

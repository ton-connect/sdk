import { Wallet, WalletInfoInjected, WalletInfoRemote } from '@tonconnect/sdk';

export type WalletOpenMethod = 'qrcode' | 'universal-link';

export type WalletInfoWithOpenMethod =
    | WalletInfoInjected
    | WalletInfoRemoteWithOpenMethod
    | (WalletInfoInjected & WalletInfoRemoteWithOpenMethod);

export type WalletInfoRemoteWithOpenMethod = WalletInfoRemote & {
    openMethod: WalletOpenMethod;
};

export type ConnectedWallet = Wallet & WalletInfoWithOpenMethod;

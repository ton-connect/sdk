import { Wallet, WalletInfoBase, WalletInfoInjectable, WalletInfoRemote } from '@tonconnect/sdk';

export type WalletOpenMethod = 'qrcode' | 'universal-link' | 'custom-deeplink';

export type WalletInfoWithOpenMethod =
    | WalletInfoInjectable
    | WalletInfoRemoteWithOpenMethod
    | WalletInfoWalletConnect
    | (WalletInfoInjectable & WalletInfoRemoteWithOpenMethod);

export type WalletInfoRemoteWithOpenMethod = WalletInfoRemote & {
    openMethod?: WalletOpenMethod;
};

export type WalletInfoWalletConnect = WalletInfoBase & {
    type: 'wallet-connect';
};

export type ConnectedWallet = Wallet & WalletInfoWithOpenMethod;

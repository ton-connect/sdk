import { Wallet, WalletInfoBase, WalletInfoInjectable, WalletInfoRemote } from '@tonconnect/sdk';

/** Method used to open the wallet app from the dApp. */
export type WalletOpenMethod = 'qrcode' | 'universal-link' | 'custom-deeplink';

/** Wallet info enriched with the open method used to initiate the connection. */
export type WalletInfoWithOpenMethod =
    | WalletInfoInjectable
    | WalletInfoRemoteWithOpenMethod
    | WalletInfoWalletConnect
    | (WalletInfoInjectable & WalletInfoRemoteWithOpenMethod);

/** Remote wallet info that also carries the {@link WalletOpenMethod} used to connect. */
export type WalletInfoRemoteWithOpenMethod = WalletInfoRemote & {
    openMethod?: WalletOpenMethod;
};

/** Wallet info for wallets connected via the WalletConnect bridge. */
export type WalletInfoWalletConnect = WalletInfoBase & {
    type: 'wallet-connect';
};

/** A fully connected wallet: combines session data from {@link Wallet} with its UI metadata. */
export type ConnectedWallet = Wallet & WalletInfoWithOpenMethod;

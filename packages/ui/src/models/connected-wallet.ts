import { Wallet, WalletInfoBase, WalletInfoInjectable, WalletInfoRemote } from '@tonconnect/sdk';

/**
 * How the dApp ended up connecting to the wallet. Set on
 * {@link WalletInfoRemoteWithOpenMethod.openMethod} for remote wallets.
 *
 * - `'qrcode'` — user scanned the connect QR code.
 * - `'universal-link'` — user tapped a universal link (mobile flow).
 * - `'custom-deeplink'` — user tapped a wallet-specific deep link.
 */
export type WalletOpenMethod = 'qrcode' | 'universal-link' | 'custom-deeplink';

/**
 * Wallets-list info for the connected wallet — the registry (or custom) entry
 * plus, for remote wallets, the {@link WalletOpenMethod} the user picked. It is
 * merged with the runtime `Wallet` from `@tonconnect/sdk` to form
 * {@link ConnectedWallet}, the shape `tonConnectUI.wallet` resolves to.
 *
 * Used by UI components that want to render wallet branding next to the
 * connected account.
 */
export type WalletInfoWithOpenMethod =
    | WalletInfoInjectable
    | WalletInfoRemoteWithOpenMethod
    | WalletInfoWalletConnect
    | (WalletInfoInjectable & WalletInfoRemoteWithOpenMethod);

/** Remote wallet info enriched with the {@link WalletOpenMethod} the user took. */
export type WalletInfoRemoteWithOpenMethod = WalletInfoRemote & {
    /** Which entry point the user used to connect. Set after a successful connect. */
    openMethod?: WalletOpenMethod;
};

/**
 * Pseudo-wallet entry used to surface the WalletConnect bridge inside the
 * picker. WalletConnect itself is a multi-wallet transport — the visible
 * "wallet" is a placeholder with a fixed `appName`.
 */
export type WalletInfoWalletConnect = WalletInfoBase & {
    type: 'wallet-connect';
};

/**
 * `Wallet` merged with the wallets-list entry. The shape
 * `tonConnectUI.wallet` resolves to once a wallet is connected; `null` while
 * disconnected.
 */
export type ConnectedWallet = Wallet & WalletInfoWithOpenMethod;

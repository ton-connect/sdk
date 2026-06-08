import { WalletInfoInjectable, WalletInfoRemote } from '@tonconnect/sdk';

/**
 * Shape accepted by `WalletsListConfiguration.includeWallets` to add custom
 * wallets to the picker.
 *
 * Build a `UIWallet` when the wallet your dApp targets is not yet listed in
 * the canonical wallets registry.
 *
 * @example
 * ```ts
 * tonConnectUI.uiOptions = {
 *     walletsListConfiguration: {
 *         includeWallets: [{
 *             appName: 'my-wallet',
 *             name: 'My Wallet',
 *             imageUrl: 'https://my.example/icon.png',
 *             aboutUrl: 'https://my.example/about',
 *             platforms: ['ios', 'android'],
 *             universalLink: 'https://my.example/ton-connect',
 *             bridgeUrl: 'https://bridge.my.example',
 *         }]
 *     }
 * };
 * ```
 */
export type UIWallet = Omit<WalletInfoInjectable, 'injected' | 'embedded'> | WalletInfoRemote;

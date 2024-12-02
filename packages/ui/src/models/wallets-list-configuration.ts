import { UIWallet } from './ui-wallet';

/**
 * Add corrections to the default wallets list in the modal: add custom wallets and change wallets order.
 */
export type WalletsListConfiguration = {
    /**
     * Allows to include extra wallets to the wallets list in the modal.
     */
    includeWallets?: UIWallet[];

    /**
     * Specifies a wallet to be featured in a special spot right after ecosystem wallets.
     * Should use `app_name` from the official TON wallets list:
     * https://raw.githubusercontent.com/ton-blockchain/wallets-list/main/wallets-v2.json
     */
    featuredWallet?: string;
};

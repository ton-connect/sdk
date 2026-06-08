import { UIWallet } from './ui-wallet';

/**
 * Overrides for the wallets list shown inside the connect modal — add
 * custom wallets, alter ordering, etc.
 */
export type WalletsListConfiguration = {
    /**
     * Extra wallets to append to the picker. Use this for wallets not yet
     * in the canonical
     * [wallets-list registry](https://github.com/ton-connect/wallets-list).
     * Entries appear after the registry wallets.
     */
    includeWallets?: UIWallet[];
};

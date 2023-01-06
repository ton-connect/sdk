import { UIWallet } from './ui-wallet';

export type WalletsListConfiguration =
    | WalletsListConfigurationExplicit
    | WalletsListConfigurationImplicit;

/**
 * Configure whole list of wallets in the modal. Only passed wallets will be displayed.
 */
export type WalletsListConfigurationExplicit = {
    /**
     * Allows to configure wallets order and add custom wallets. Must be an array of wallets names from WalletsList or custom wallets.
     */
    wallets: (string | UIWallet)[];
};

/**
 * Add corrections to the default wallets list in the modal: exclude some wallets and add custom wallets.
 */
export type WalletsListConfigurationImplicit = {
    /**
     * Allows to exclude wallets from wallets list in the modal by its names. Must be an array of wallet's names from WalletsList.
     */
    excludeWallets?: string[];

    /**
     * Allows to include extra wallets to the wallets list in the modal.
     */
    includeWallets?: UIWallet[];

    /**
     * Allows to specify order of the extra wallets in the wallets list in the modal. Cannot be applied if `includeWallets` is not specified.
     * @default 'end'.
     */
    includeWalletsOrder?: 'start' | 'end';
};

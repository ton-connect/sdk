import { UIWallet } from './ui-wallet';

/**
 * Add corrections to the default wallets list in the modal: add custom wallets and change wallets order.
 */
export type WalletsListConfiguration = {
    /**
     * Allows to include extra wallets to the wallets list in the modal.
     */
    includeWallets?: UIWallet[];
};

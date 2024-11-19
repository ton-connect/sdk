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
     * List of wallet IDs to be displayed first in the specified order.
     * Other wallets will be shown below in their original order.
     */
    customOrder?: string[];
};

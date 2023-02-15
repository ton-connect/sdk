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
     * Allows to configure wallets order by theirs names. You cannot exclude wallets from the list with this property.
     * Not mentioned wallets will be included to the end of the list.
     */
    walletsOrder?: string[];
};

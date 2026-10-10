import { OptionalTraceable, WalletInfoRemote } from '@tonconnect/sdk';
import { WalletsModalCloseReason } from 'src/models/wallets-modal';

export interface SingleWalletModal {
    /**
     * Open the modal with the specified wallet.
     */
    open: (wallet: string) => void;

    /**
     * Close the modal.
     */
    close: (closeReason?: WalletsModalCloseReason) => void;

    /**
     * Subscribe to the modal window status changes.
     */
    onStateChange: (callback: (state: SingleWalletModalState) => void) => () => void;

    /**
     * Current modal window state.
     */
    state: SingleWalletModalState;
}

/**
 * Opened modal window state.
 */
export type SingleWalletModalOpened = {
    /**
     * Modal window status.
     */
    status: 'opened';

    /**
     * Wallet info.
     */
    walletInfo: WalletInfoRemote;

    /**
     * Always `null` for opened modal window.
     */
    closeReason: null;
};

/**
 * Closed modal window state.
 */
export type SingleWalletModalClosed = {
    /**
     * Modal window status.
     */
    status: 'closed';

    /**
     * Close reason, if the modal window was closed.
     */
    closeReason: SingleWalletModalCloseReason | null;
};

/**
 * Discriminated union of all modal states, wrapped in `OptionalTraceable`
 * so consumers can correlate state events with the analytics trace id.
 */
export type SingleWalletModalState = OptionalTraceable<
    SingleWalletModalOpened | SingleWalletModalClosed
>;

/**
 * Modal window close reason.
 */
export type SingleWalletModalCloseReason = 'action-cancelled' | 'wallet-selected';

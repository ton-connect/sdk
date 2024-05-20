export interface WalletsModal {
    /**
     * Open the modal.
     */
    open: () => void;

    /**
     * Close the modal.
     * @default 'action-cancelled'
     */
    close: (reason?: WalletsModalCloseReason) => void;

    /**
     * Subscribe to the modal window status changes.
     */
    onStateChange: (callback: (state: WalletsModalState) => void) => () => void;

    /**
     * Current modal window state.
     */
    state: WalletsModalState;
}

/**
 * Opened modal window state.
 */
export type WalletModalOpened = {
    /**
     * Modal window status.
     */
    status: 'opened';

    /**
     * Always `null` for opened modal window.
     */
    closeReason: null;
};

/**
 * Closed modal window state.
 */
export type WalletModalClosed = {
    /**
     * Modal window status.
     */
    status: 'closed';

    /**
     * Close reason, if the modal window was closed.
     */
    closeReason: WalletsModalCloseReason | null;
};

/**
 * Modal window state.
 */
export type WalletsModalState = WalletModalOpened | WalletModalClosed;

/**
 * Modal window close reason.
 */
export type WalletsModalCloseReason = 'action-cancelled' | 'wallet-selected';

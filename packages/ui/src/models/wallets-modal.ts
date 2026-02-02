import { FeatureName, OptionalTraceable, RequiredFeatures } from '@tonconnect/sdk';

export interface WalletsModal {
    /**
     * Open the modal.
     */
    open: (options?: OptionalTraceable) => void;

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

export type ChooseSupportedFeatureWalletsModal = {
    /**
     * Modal window status.
     */
    status: 'opened';

    /**
     * Always `null` for choose supported feature wallet modal.
     */
    closeReason: null;
    type: 'wallet-not-support-feature';
    requiredFeature: {
        featureName: FeatureName;
        value?: RequiredFeatures['sendTransaction'];
    };
};

/**
 * Modal window state.
 */
export type WalletsModalState = OptionalTraceable<
    WalletModalOpened | WalletModalClosed | ChooseSupportedFeatureWalletsModal
> & {
    /**
     * Optional intent link for displaying QR code directly
     */
    intentLink?: string;
};

/**
 * Modal window close reason.
 */
export type WalletsModalCloseReason = 'action-cancelled' | 'wallet-selected';

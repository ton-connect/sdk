import { EmbeddedRequest, FeatureName, OptionalTraceable, RequiredFeatures } from '@tonconnect/sdk';
import { Consumable } from 'src/utils/consumable';

export interface WalletsModal {
    /**
     * Open the modal.
     */
    open: (options?: OptionalTraceable<{ embeddedRequest?: Consumable<EmbeddedRequest> }>) => void;

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

    /**
     * Embedded deep link request to include in the connect URL.
     * Present only when the modal was opened via `initiateDeepLinkFlow`.
     */
    embeddedRequest?: Consumable<EmbeddedRequest> | null;
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
>;

/**
 * Modal window close reason.
 */
export type WalletsModalCloseReason = 'action-cancelled' | 'wallet-selected';

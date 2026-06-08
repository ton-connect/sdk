import {
    EmbeddedRequest,
    FeatureName,
    OptionalTraceable,
    RequiredFeatures,
    Consumable
} from '@tonconnect/sdk';

/**
 * Imperative handle on the connect-wallet modal. Available as
 * `tonConnectUI.modal`. Prefer the convenience methods on `TonConnectUI`
 * (`openModal()`, `closeModal()`, `onModalStateChange()`) — this interface
 * is exposed for advanced cases that need direct access to the modal state.
 */
export interface WalletsModal {
    /**
     * Open the modal.
     */
    open: (options?: OptionalTraceable) => void;

    /**
     * Close the modal. The optional `reason` is forwarded to subscribers via
     * {@link WalletModalClosed.closeReason}.
     */
    close: (reason?: WalletsModalCloseReason) => void;

    /**
     * Subscribe to modal state changes. Returns an unsubscribe function.
     *
     * @returns Call to stop listening.
     */
    onStateChange: (callback: (state: WalletsModalState) => void) => () => void;

    /** Current modal state — snapshot, not reactive. */
    state: WalletsModalState;
}

/**
 * Modal is open. When the modal was opened via the
 * embedded-request flow, `embeddedRequest` carries the queued
 * `sendTransaction` / `signData` / `signMessage` the SDK will fold into
 * the connect URL.
 */
export type WalletModalOpened = {
    status: 'opened';

    /** Always `null` while the modal is open. */
    closeReason: null;

    /**
     * One-shot envelope holding the queued embedded request, if any. The
     * SDK consumes it once when building the connect URL — a retry will see
     * `consumed: true` and skip embedding.
     */
    embeddedRequest?: Consumable<EmbeddedRequest> | null;
};

/** Modal is closed. `closeReason` is populated when the close was driven by the user. */
export type WalletModalClosed = {
    status: 'closed';

    /** Why the modal closed; `null` for the initial closed state. */
    closeReason: WalletsModalCloseReason | null;
};

/**
 * Special "wallet does not support a required feature" view of the modal,
 * shown when the user picks a wallet that fails a `walletsRequiredFeatures`
 * check at connect time.
 */
export type ChooseSupportedFeatureWalletsModal = {
    status: 'opened';

    closeReason: null;
    type: 'wallet-not-support-feature';
    /**
     * The feature the wallet failed to satisfy — `featureName` plus the
     * constraint values the dApp asked for (`RequiredFeatures` entry).
     */
    requiredFeature: {
        featureName: FeatureName;
        value?: RequiredFeatures['sendTransaction'];
    };
};

/**
 * Discriminated union of all modal states, wrapped in `OptionalTraceable`
 * so consumers can correlate state events with the analytics trace id.
 */
export type WalletsModalState = OptionalTraceable<
    WalletModalOpened | WalletModalClosed | ChooseSupportedFeatureWalletsModal
>;

/**
 * Why the modal closed.
 *
 * - `'action-cancelled'` — user dismissed without picking a wallet (default
 *   for programmatic `close()`).
 * - `'wallet-selected'` — user picked a wallet and connect flow took over.
 */
export type WalletsModalCloseReason = 'action-cancelled' | 'wallet-selected';

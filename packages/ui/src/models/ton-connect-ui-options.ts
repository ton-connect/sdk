import { Locales } from 'src/models/locales';
import { UIPreferences } from 'src/models/ui-preferences';
import { WalletsListConfiguration } from 'src/models/wallets-list-configuration';
import { ActionConfiguration } from 'src/models/action-configuration';
import { AnalyticsSettings, RequiredFeatures } from '@tonconnect/sdk';

/**
 * Runtime-tunable UI options. Pass on the constructor, or assign through
 * `tonConnectUI.uiOptions = { ... }` to update them later — the setter
 * merges the patch with the previous value and re-renders.
 */
export interface TonConnectUiOptions {
    /**
     * Visual configuration — theme, border radius, color overrides.
     */
    uiPreferences?: UIPreferences;

    /**
     * HTML element id under which the "Connect Wallet" button mounts. With
     * `null` (default) the button is not rendered — use this when the dApp
     * triggers the modal from a custom control via `tonConnectUI.openModal()`.
     *
     * @default null
     */
    buttonRootId?: string | null;

    /**
     * Language for the strings shown inside SDK-rendered UI.
     *
     * @default 'en'
     */
    language?: Locales;

    /**
     * Wallets-list overrides — include extra wallets, reorder existing ones.
     * See {@link WalletsListConfiguration}.
     */
    walletsListConfiguration?: WalletsListConfiguration;

    /**
     * Hide wallets that don't advertise the listed features. Non-matching
     * entries are greyed out below the separator on the "All wallets" screen
     * and rejected at connect time with `WalletMissingRequiredFeaturesError`.
     *
     * @see [Filter wallets by required features (docs)](https://docs.ton.org/applications/ton-connect/how-to/filter-wallets)
     */
    walletsRequiredFeatures?: RequiredFeatures;

    /**
     * Soft preference filter — non-matching wallets are still clickable but
     * sorted below the separator. Same shape as
     * {@link walletsRequiredFeatures}; the SDK does NOT enforce the match at
     * connect time, so the dApp must handle missing features itself.
     */
    walletsPreferredFeatures?: RequiredFeatures;

    /**
     * Modal / notification behavior and the return strategy for action
     * deep links (`sendTransaction`, `signData`, `signMessage`).
     * See {@link ActionConfiguration}.
     */
    actionsConfiguration?: ActionConfiguration;

    /**
     * Close modals and notifications when the Android system back button is
     * pressed. Disable when the dApp manages browser history manually.
     *
     * @default true
     */
    enableAndroidBackHandler?: boolean;

    /**
     * Analytics configuration forwarded to the underlying `TonConnect`
     * instance. See {@link AnalyticsSettings} from `@tonconnect/sdk`.
     */
    analytics?: AnalyticsSettings;
}

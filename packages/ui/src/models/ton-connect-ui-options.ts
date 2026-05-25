import { Locales } from 'src/models/locales';
import { UIPreferences } from 'src/models/ui-preferences';
import { WalletsListConfiguration } from 'src/models/wallets-list-configuration';
import { ActionConfiguration } from 'src/models/action-configuration';
import { AnalyticsSettings, RequiredFeatures } from '@tonconnect/sdk';

export interface TonConnectUiOptions {
    /**
     * UI elements configuration.
     */
    uiPreferences?: UIPreferences;

    /**
     * HTML element id to attach the wallet connect button. If not passed the button does not appear.
     * @default null
     */
    buttonRootId?: string | null;

    /**
     * Language for the phrases in the UI elements.
     * @default 'en'
     */
    language?: Locales;

    /**
     * Configuration for the wallets list in the connect wallet modal.
     */
    walletsListConfiguration?: WalletsListConfiguration;

    /**
     * Required features for wallets. If a wallet doesn't support the required features, it is disabled.
     */
    walletsRequiredFeatures?: RequiredFeatures;

    /**
     * Preferred features for wallets. If a wallet doesn't support the preferred features, it is moved to the end of the list.
     */
    walletsPreferredFeatures?: RequiredFeatures;

    /**
     * Configuration for action-period (e.g. sendTransaction) UI elements: modals and notifications and wallet behaviour (return strategy).
     */
    actionsConfiguration?: ActionConfiguration;

    /**
     * Specifies whether the Android back button should be used to close modals and notifications on Android devices.
     * @default true
     */
    enableAndroidBackHandler?: boolean;

    /**
     * Analytics configuration forwarded to the underlying TonConnect SDK instance.
     */
    analytics?: AnalyticsSettings;
}

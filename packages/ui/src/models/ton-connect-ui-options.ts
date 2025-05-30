import { Locales } from 'src/models/locales';
import { UIPreferences } from 'src/models/ui-preferences';
import { WalletsListConfiguration } from 'src/models/wallets-list-configuration';
import { ActionConfiguration } from 'src/models/action-configuration';
import { RequiredFeatures } from '@tonconnect/sdk';

export interface TonConnectUiOptions {
    /**
     * UI elements configuration.
     */
    uiPreferences?: UIPreferences;

    /**
     * HTML element id to attach the wallet connect button. If not passed button won't appear.
     * @default null.
     */
    buttonRootId?: string | null;

    /**
     * Language for the phrases it the UI elements.
     * @default system
     */
    language?: Locales;

    /**
     * Configuration for the wallets list in the connect wallet modal.
     */
    walletsListConfiguration?: WalletsListConfiguration;

    /**
     * Required features for wallets. If wallet doesn't support required features, it will be disabled.
     */
    walletsRequiredFeatures?: RequiredFeatures;

    /**
     * Preferred features for wallets. If wallet doesn't support preferred features, it will be moved to the end of the list.
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
}

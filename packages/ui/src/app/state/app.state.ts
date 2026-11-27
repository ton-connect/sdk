import { ConnectAdditionalRequest, RequiredFeatures, ITonConnect } from '@tonconnect/sdk';
import { createStore } from 'solid-js/store';
import { Locales } from 'src/models/locales';
import { WalletsListConfiguration } from 'src/models/wallets-list-configuration';
import { ReturnStrategy } from 'src/models/return-strategy';
import { Loadable } from 'src/models/loadable';
import { TonConnectUITracker } from 'src/tracker/ton-connect-ui-tracker';

export type AppState = {
    connector: ITonConnect;
    /**
     * Analytics tracker, so views can report user actions at the point the action happens rather
     * than having them reconstructed afterwards from module-level signals.
     */
    tracker: TonConnectUITracker;
    buttonRootId: string | null;
    language: Locales;
    walletsListConfiguration: WalletsListConfiguration | {};
    connectRequestParameters?: Loadable<ConnectAdditionalRequest> | null;
    returnStrategy: ReturnStrategy;
    twaReturnUrl: `${string}://${string}` | undefined;
    preferredWalletAppName: string | undefined;
    enableAndroidBackHandler: boolean;
    /** `uiPreferences.withSecondaryButton`: Gram Wallet gets its own button on mobile. */
    withSecondaryButton: boolean;
    /** `uiPreferences.isCompact`: the mobile wallets row is folded behind a toggle. */
    isCompact: boolean;
    walletsRequiredFeatures: RequiredFeatures | undefined;
    walletsPreferredFeatures: RequiredFeatures | undefined;
};

export const [appState, setAppState] = createStore<AppState>({
    buttonRootId: null,
    language: 'en',
    returnStrategy: 'back',
    twaReturnUrl: undefined,
    walletsListConfiguration: {},
    enableAndroidBackHandler: true,
    withSecondaryButton: false,
    isCompact: false
} as AppState);

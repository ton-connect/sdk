import { ConnectAdditionalRequest, RequireFeature, Feature, ITonConnect } from '@tonconnect/sdk';
import { createStore } from 'solid-js/store';
import { Locales } from 'src/models/locales';
import { WalletsListConfiguration } from 'src/models/wallets-list-configuration';
import { ReturnStrategy } from 'src/models/return-strategy';
import { Loadable } from 'src/models/loadable';

export type AppState = {
    connector: ITonConnect;
    buttonRootId: string | null;
    language: Locales;
    walletsListConfiguration: WalletsListConfiguration | {};
    connectRequestParameters?: Loadable<ConnectAdditionalRequest> | null;
    returnStrategy: ReturnStrategy;
    twaReturnUrl: `${string}://${string}` | undefined;
    preferredWalletAppName: string | undefined;
    enableAndroidBackHandler: boolean;
    walletsRequiredFeatures: RequireFeature[] | ((features: Feature[]) => boolean) | undefined;
};

export const [appState, setAppState] = createStore<AppState>({
    buttonRootId: null,
    language: 'en',
    returnStrategy: 'back',
    twaReturnUrl: undefined,
    walletsListConfiguration: {},
    enableAndroidBackHandler: true
} as AppState);

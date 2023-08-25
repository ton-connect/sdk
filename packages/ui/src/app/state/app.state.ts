import { ConnectAdditionalRequest, ITonConnect } from '@tonconnect/sdk';
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
    preferredWalletAppName: string | undefined;
};

export const [appState, setAppState] = createStore<AppState>({
    buttonRootId: null,
    language: 'en',
    returnStrategy: 'back',
    walletsListConfiguration: {}
} as AppState);

import { ConnectAdditionalRequest, ITonConnect } from '@tonconnect/sdk';
import { createStore } from 'solid-js/store';
import { Locales } from 'src/models/locales';
import { WalletsListConfiguration } from 'src/models/wallets-list-configuration';
import { ReturnStrategy } from 'src/models/return-strategy';

export type AppState = {
    connector: ITonConnect;
    buttonRootId: string | null;
    language: Locales;
    walletsListConfiguration: WalletsListConfiguration | {};
    getConnectParameters?: () => Promise<ConnectAdditionalRequest>;
    returnStrategy: ReturnStrategy;
    preferredWalletName: string | undefined;
};

export const [appState, setAppState] = createStore<AppState>({
    buttonRootId: null,
    language: 'en',
    returnStrategy: 'back',
    walletsListConfiguration: {}
} as AppState);

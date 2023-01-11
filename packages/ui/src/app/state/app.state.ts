import { ITonConnect } from '@tonconnect/sdk';
import { createStore } from 'solid-js/store';
import { Locales } from 'src/models/locales';
import { WalletsListConfiguration } from 'src/models/wallets-list-configuration';

export type AppState = {
    connector: ITonConnect;
    buttonRootId: string | null;
    language: Locales;
    walletsList: WalletsListConfiguration | {};
};

export const [appState, setAppState] = createStore<AppState>({
    buttonRootId: null,
    language: 'en',
    walletsList: {}
} as AppState);

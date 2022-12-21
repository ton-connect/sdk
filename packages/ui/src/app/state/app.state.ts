import { ITonConnect } from '@tonconnect/sdk';
import { ButtonConfiguration } from 'src/models/button-configuration';
import { WidgetConfiguration } from 'src/models/widget-configuration';
import { createStore } from 'solid-js/store';
import { Locales } from 'src/models/locales';

export type AppState = {
    connector: ITonConnect;
    buttonRootId: string | null;
    language: Locales;
    buttonConfiguration: ButtonConfiguration;
    widgetConfiguration: WidgetConfiguration;
};

export const [appState, setAppState] = createStore<AppState>({
    buttonRootId: null,
    language: 'en'
} as AppState);

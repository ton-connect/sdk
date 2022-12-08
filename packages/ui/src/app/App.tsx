import { ITonConnect } from '@tonconnect/sdk';
import { Show } from 'solid-js';
import type { Component } from 'solid-js';
import { Portal } from 'solid-js/web';
import { ThemeProvider } from 'solid-styled-components';
import { i18nDictionary } from 'src/app/i18n';
import { ConnectorContext } from 'src/app/state/connector.context';
import { themeState } from 'src/app/state/theme-state';
import { GlobalStyles } from 'src/app/styles/global-styles';
import { AccountButton } from 'src/app/views/account-button';
import { ActionsModal, WalletsModal } from 'src/app/views/modals';
import './styles/style.d.ts';
import { TonConnectUi } from 'src/ton-connect-ui';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { createI18nContext, I18nContext } from '@solid-primitives/i18n';

export type AppProps = {
    buttonRoot: HTMLElement | null;
    tonConnectUI: TonConnectUi;
    connector: ITonConnect;
};

const App: Component<AppProps> = props => {
    const translations = createI18nContext(i18nDictionary, 'ru');

    return (
        <I18nContext.Provider value={translations}>
            <TonConnectUiContext.Provider value={props.tonConnectUI}>
                <ConnectorContext.Provider value={props.connector}>
                    <GlobalStyles />
                    <ThemeProvider theme={themeState}>
                        <Show when={props.buttonRoot}>
                            <Portal mount={props.buttonRoot!}>
                                <AccountButton />
                            </Portal>
                        </Show>
                        <WalletsModal />
                        <ActionsModal />
                    </ThemeProvider>
                </ConnectorContext.Provider>
            </TonConnectUiContext.Provider>
        </I18nContext.Provider>
    );
};

export default App;

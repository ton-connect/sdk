import './global.d.ts';
import { Show } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic, Portal } from 'solid-js/web';
import { ThemeProvider } from 'solid-styled-components';
import { i18nDictionary } from 'src/app/i18n';
import { ConnectorContext } from 'src/app/state/connector.context';
import { themeState } from 'src/app/state/theme-state';
import { GlobalStyles, globalStylesTag } from 'src/app/styles/global-styles';
import { AccountButton } from 'src/app/views/account-button';
import { ActionsModal, WalletsModal } from 'src/app/views/modals';
import './styles/style.d.ts';
import { TonConnectUI } from 'src/ton-connect-ui';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { createI18nContext, I18nContext } from '@solid-primitives/i18n';
import { appState } from 'src/app/state/app.state';
import { defineStylesRoot, fixMobileSafariActiveTransition } from 'src/app/utils/web-api';
import { SingleWalletModal } from 'src/app/views/modals/wallets-modal/single-wallet-modal';

export type AppProps = {
    tonConnectUI: TonConnectUI;
};

const App: Component<AppProps> = props => {
    const translations = createI18nContext(i18nDictionary, appState.language);

    defineStylesRoot();
    fixMobileSafariActiveTransition();

    return (
        <I18nContext.Provider value={translations}>
            <TonConnectUiContext.Provider value={props.tonConnectUI}>
                <ConnectorContext.Provider value={appState.connector}>
                    <GlobalStyles />
                    <ThemeProvider theme={themeState}>
                        <Show when={appState.buttonRootId}>
                            <Portal mount={document.getElementById(appState.buttonRootId!)!}>
                                <AccountButton />
                            </Portal>
                        </Show>
                        <Dynamic component={globalStylesTag}>
                            <WalletsModal />
                            <SingleWalletModal />
                            <ActionsModal />
                        </Dynamic>
                    </ThemeProvider>
                </ConnectorContext.Provider>
            </TonConnectUiContext.Provider>
        </I18nContext.Provider>
    );
};

export default App;

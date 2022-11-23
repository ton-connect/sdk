import { Show } from 'solid-js';
import type { Component } from 'solid-js';
import { Portal } from 'solid-js/web';
import { ThemeProvider } from 'solid-styled-components';
import { actionModalOpen } from 'src/app/state/modals-state';
import { themeState } from 'src/app/state/theme-state';
import { GlobalStyles } from 'src/app/styles/global-styles';
import { AccountButton } from 'src/app/views/account-button';
import { ActionsModal, WalletsModal } from 'src/app/views/modals';
import './styles/style.d.ts';
import { TonConnectUi } from 'src/ton-connect-ui';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';

export type AppProps = {
    buttonRoot: HTMLElement | null;
    widgetController: TonConnectUi;
};

const App: Component<AppProps> = props => {
    return (
        <TonConnectUiContext.Provider value={props.widgetController}>
            <GlobalStyles />
            <ThemeProvider theme={themeState}>
                <Show when={props.buttonRoot}>
                    <Portal mount={props.buttonRoot!}>
                        <AccountButton widgetController={props.widgetController} />
                    </Portal>
                </Show>
                <WalletsModal />
                <Show when={actionModalOpen()}>
                    <ActionsModal />
                </Show>
            </ThemeProvider>
        </TonConnectUiContext.Provider>
    );
};

export default App;

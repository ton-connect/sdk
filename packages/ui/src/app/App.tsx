import { Show } from 'solid-js';
import type { Component } from 'solid-js';
import { ThemeProvider } from 'solid-styled-components';
import { actionModalOpen, walletsModalOpen } from 'src/app/state/modals-state';
import { themeState } from 'src/app/state/theme-state';
import { GlobalStyles } from 'src/app/styles/global-styles';
import { ActionsModal, WalletsModal } from 'src/app/views/modals';
import './styles/style.d.ts';

const App: Component = () => {
    return (
        <>
            <GlobalStyles />
            <ThemeProvider theme={themeState}>
                <Show when={walletsModalOpen()}>
                    <WalletsModal />
                </Show>
                <Show when={actionModalOpen()}>
                    <ActionsModal />
                </Show>
            </ThemeProvider>
        </>
    );
};

export default App;

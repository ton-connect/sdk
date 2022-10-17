import { Show } from 'solid-js';
import type { Component } from 'solid-js';
import { actionModalOpen, walletsModalOpen } from 'src/app/controllers/app-controller';
import { ActionsModal, WalletsModal } from 'src/app/views/modals';

const App: Component = () => {
    return (
        <>
            <Show when={walletsModalOpen()}>
                <WalletsModal />
            </Show>
            <Show when={actionModalOpen()}>
                <ActionsModal />
            </Show>
        </>
    );
};

export default App;

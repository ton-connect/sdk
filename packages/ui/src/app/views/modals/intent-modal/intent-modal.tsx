import { Component, Show, createMemo } from 'solid-js';
import { Modal } from 'src/app/components';
import { appState } from 'src/app/state/app.state';
import { intentModalState, setIntentModalState } from 'src/app/state/intent-modal-state';
import { IntentQRModal } from './intent-qr-modal';

export const IntentModal: Component = () => {
    const isOpened = createMemo(() => intentModalState().status === 'opened');
    const state = createMemo(() => intentModalState());

    return (
        <Modal
            opened={isOpened()}
            enableAndroidBackHandler={appState.enableAndroidBackHandler}
            onClose={() => setIntentModalState({ status: 'closed' })}
            showFooter={false}
            data-tc-intent-modal-container="true"
        >
            <Show when={isOpened() && state().status === 'opened' && 'universalLink' in state()}>
                <IntentQRModal
                    universalLink={
                        (state() as { status: 'opened'; universalLink: string }).universalLink
                    }
                    onClose={() => setIntentModalState({ status: 'closed' })}
                />
            </Show>
        </Modal>
    );
};

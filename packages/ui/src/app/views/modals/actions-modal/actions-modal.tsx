import { Component, Match, Switch } from 'solid-js';
import { Modal } from 'src/app/components';
import { appState } from 'src/app/state/app.state';
import { action, setAction } from 'src/app/state/modals-state';
import { ConfirmModal } from './confirm-modal';
import { SuccessModal } from './success-modal';
import { CanceledModal } from './canceled-modal';

export const ActionsModal: Component = () => {
    return (
        <Modal
            opened={action() !== null && action()?.openModal === true}
            enableAndroidBackHandler={appState.enableAndroidBackHandler}
            onClose={() => setAction(null)}
            showFooter={false}
            data-tc-actions-modal-container="true"
        >
            <Switch>
                <Match
                    when={
                        action() &&
                        (action()!.name === 'confirm-transaction' ||
                            action()!.name === 'confirm-sign-data' ||
                            action()!.name === 'confirm-sign-message' ||
                            action()!.name === 'confirm-action')
                    }
                >
                    <ConfirmModal onClose={() => setAction(null)} />
                </Match>
                <Match
                    when={
                        action() &&
                        (action()!.name === 'transaction-sent' ||
                            action()!.name === 'data-signed' ||
                            action()!.name === 'message-signed' ||
                            action()!.name === 'action-sent')
                    }
                >
                    <SuccessModal onClose={() => setAction(null)} />
                </Match>
                <Match
                    when={
                        action() &&
                        (action()!.name === 'transaction-canceled' ||
                            action()!.name === 'sign-data-canceled' ||
                            action()!.name === 'sign-message-canceled' ||
                            action()!.name === 'action-canceled')
                    }
                >
                    <CanceledModal onClose={() => setAction(null)} />
                </Match>
            </Switch>
        </Modal>
    );
};

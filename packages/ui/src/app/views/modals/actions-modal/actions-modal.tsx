import { Component, Match, Switch } from 'solid-js';
import { Modal } from 'src/app/components';
import { action, setAction } from 'src/app/state/modals-state';
import { ConfirmTransactionModal } from 'src/app/views/modals/actions-modal/confirm-transaction-modal';
import { TransactionCanceledModal } from 'src/app/views/modals/actions-modal/transaction-canceled-modal';
import { TransactionSentModal } from 'src/app/views/modals/actions-modal/transaction-sent-modal';

export const ActionsModal: Component = () => {
    return (
        <Modal
            opened={action() !== null && action()?.openModal === true}
            onClose={() => setAction(null)}
            id="tc-actions-modal-container"
        >
            <Switch>
                <Match when={action()!.name === 'transaction-sent'}>
                    <TransactionSentModal
                        onClose={() => setAction(null)}
                        id="tc-transaction-sent-modal"
                    />
                </Match>
                <Match when={action()!.name === 'transaction-canceled'}>
                    <TransactionCanceledModal
                        onClose={() => setAction(null)}
                        id="tc-transaction-canceled-modal"
                    />
                </Match>
                <Match when={action()!.name === 'confirm-transaction'}>
                    <ConfirmTransactionModal
                        onClose={() => setAction(null)}
                        id="tc-confirm-modal"
                    />
                </Match>
            </Switch>
        </Modal>
    );
};

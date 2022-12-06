import { Component, Match, Switch } from 'solid-js';
import { Modal } from 'src/app/components';
import { actionModalOpen, setActionModalOpen } from 'src/app/state/modals-state';
import { ConfirmTransactionModal } from 'src/app/views/modals/actions-modal/confirm-transaction-modal';
import { TransactionCanceledModal } from 'src/app/views/modals/actions-modal/transaction-canceled-modal';
import { TransactionSentModal } from 'src/app/views/modals/actions-modal/transaction-sent-modal';

export const ActionsModal: Component = () => {
    return (
        <Modal opened={actionModalOpen() !== null} onClose={() => setActionModalOpen(null)}>
            <Switch>
                <Match when={actionModalOpen() === 'transaction-sent'}>
                    <TransactionSentModal onClose={() => setActionModalOpen(null)} />
                </Match>
                <Match when={actionModalOpen() === 'transaction-canceled'}>
                    <TransactionCanceledModal onClose={() => setActionModalOpen(null)} />
                </Match>
                <Match when={actionModalOpen() === 'confirm-transaction'}>
                    <ConfirmTransactionModal onClose={() => setActionModalOpen(null)} />
                </Match>
            </Switch>
        </Modal>
    );
};

import { Component, Match, Switch } from 'solid-js';
import { Modal } from 'src/app/components';
import { Crossfade } from 'src/app/components/crossfade';
import { appState } from 'src/app/state/app.state';
import {
    action,
    confirmActionNames,
    errorActionNames,
    setAction,
    successActionNames
} from 'src/app/state/modals-state';
import { ConfirmTransactionModal } from 'src/app/views/modals/actions-modal/confirm-transaction-modal';
import { TransactionCanceledModal } from 'src/app/views/modals/actions-modal/transaction-canceled-modal';
import { TransactionSentModal } from 'src/app/views/modals/actions-modal/transaction-sent-modal';
import { ConfirmSignDataModal } from './confirm-sign-data-modal';
import { SignDataCanceledModal } from './sign-data-canceled-modal';
import { DataSignedModal } from './data-signed-modal';
import { ConfirmSignMessageModal } from './confirm-sign-message-modal';
import { MessageSignedModal } from './message-signed-modal';
import { SignMessageCanceledModal } from './sign-message-canceled-modal';

export const ActionsModal: Component = () => {
    return (
        <Modal
            opened={action() !== null && action()?.openModal === true}
            enableAndroidBackHandler={appState.enableAndroidBackHandler}
            onClose={() => setAction(null)}
            data-tc-actions-modal-container="true"
        >
            <Crossfade>
                <Switch>
                    <Match when={action()!.name === successActionNames.sendTransaction}>
                        <TransactionSentModal onClose={() => setAction(null)} />
                    </Match>
                    <Match when={action()!.name === errorActionNames.sendTransaction}>
                        <TransactionCanceledModal onClose={() => setAction(null)} />
                    </Match>
                    <Match when={action()!.name === confirmActionNames.sendTransaction}>
                        <ConfirmTransactionModal onClose={() => setAction(null)} />
                    </Match>
                    <Match when={action()!.name === successActionNames.signData}>
                        <DataSignedModal onClose={() => setAction(null)} />
                    </Match>
                    <Match when={action()!.name === errorActionNames.signData}>
                        <SignDataCanceledModal onClose={() => setAction(null)} />
                    </Match>
                    <Match when={action()!.name === confirmActionNames.signData}>
                        <ConfirmSignDataModal onClose={() => setAction(null)} />
                    </Match>
                    <Match when={action()!.name === successActionNames.signMessage}>
                        <MessageSignedModal onClose={() => setAction(null)} />
                    </Match>
                    <Match when={action()!.name === errorActionNames.signMessage}>
                        <SignMessageCanceledModal onClose={() => setAction(null)} />
                    </Match>
                    <Match when={action()!.name === confirmActionNames.signMessage}>
                        <ConfirmSignMessageModal onClose={() => setAction(null)} />
                    </Match>
                </Switch>
            </Crossfade>
        </Modal>
    );
};

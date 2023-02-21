import { Component } from 'solid-js';
import { ActionModal } from 'src/app/views/modals/actions-modal/action-modal';
import { Identifiable } from 'src/app/models/identifiable';
import { SuccessIcon } from 'src/app/components';

interface TransactionSentModalProps extends Identifiable {
    onClose: () => void;
}

export const TransactionSentModal: Component<TransactionSentModalProps> = props => {
    return (
        <ActionModal
            headerTranslationKey="actionModal.transactionSent.header"
            textTranslationKey="actionModal.transactionSent.text"
            icon={<SuccessIcon size="m" />}
            onClose={() => props.onClose()}
            id={props.id}
        />
    );
};

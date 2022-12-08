import { Component } from 'solid-js';
import { ActionModal } from 'src/app/views/modals/actions-modal/action-modal';
import { ErrorIconStyled } from 'src/app/views/modals/actions-modal/transaction-canceled-modal/style';

interface TransactionCanceledModalProps {
    onClose: () => void;
}

export const TransactionCanceledModal: Component<TransactionCanceledModalProps> = props => {
    return (
        <ActionModal
            headerTranslationKey="actionModal.transactionCanceled.header"
            textTranslationKey="actionModal.transactionCanceled.text"
            icon={<ErrorIconStyled />}
            onClose={() => props.onClose()}
        />
    );
};

import { Component } from 'solid-js';
import { ActionModal } from 'src/app/views/modals/actions-modal/action-modal';
import { ErrorIconStyled } from 'src/app/views/modals/actions-modal/transaction-canceled-modal/style';

interface TransactionCanceledModalProps {
    onClose: () => void;
}

export const TransactionCanceledModal: Component<TransactionCanceledModalProps> = props => {
    return (
        <ActionModal
            title="Transaction cancelled"
            icon={<ErrorIconStyled />}
            onClose={() => props.onClose()}
        >
            The transaction was canceled because there were no expected changes in the blockchain.
        </ActionModal>
    );
};

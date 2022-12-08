import { Component } from 'solid-js';
import { ActionModal } from 'src/app/views/modals/actions-modal/action-modal';
import { SuccessIconStyled } from './style';

interface TransactionSentModalProps {
    onClose: () => void;
}

export const TransactionSentModal: Component<TransactionSentModalProps> = props => {
    return (
        <ActionModal
            headerTranslationKey="actionModal.transactionSent.header"
            textTranslationKey="actionModal.transactionSent.text"
            icon={<SuccessIconStyled />}
            onClose={() => props.onClose()}
        />
    );
};

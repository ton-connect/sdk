import { Component } from 'solid-js';
import { ActionModal } from 'src/app/views/modals/actions-modal/action-modal';
import { SuccessIconStyled } from './style';

interface TransactionSentModalProps {
    onClose: () => void;
}

export const TransactionSentModal: Component<TransactionSentModalProps> = props => {
    return (
        <ActionModal
            title="Transaction sent"
            icon={<SuccessIconStyled />}
            onClose={() => props.onClose()}
        >
            It will take a few seconds until it is confirmed by the network
        </ActionModal>
    );
};

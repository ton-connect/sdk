import { Component } from 'solid-js';
import { ActionModal } from 'src/app/views/modals/actions-modal/action-modal';
import { LoaderIconStyled } from './style';
import { Identifiable } from 'src/app/models/identifiable';

interface ConfirmTransactionModalProps extends Identifiable {
    onClose: () => void;
}

export const ConfirmTransactionModal: Component<ConfirmTransactionModalProps> = props => {
    return (
        <ActionModal
            headerTranslationKey="actionModal.confirmTransaction.header"
            textTranslationKey="actionModal.confirmTransaction.text"
            icon={<LoaderIconStyled />}
            onClose={() => props.onClose()}
            showButton={false}
            id={props.id}
        />
    );
};

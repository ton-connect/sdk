import { Component } from 'solid-js';
import { ActionModal } from 'src/app/views/modals/actions-modal/action-modal';
import { LoaderIconStyled } from './style';

interface ConfirmTransactionModalProps {
    onClose: () => void;
}

export const ConfirmTransactionModal: Component<ConfirmTransactionModalProps> = props => {
    return (
        <ActionModal
            title="Confirm transaction in your wallet"
            icon={<LoaderIconStyled fill="#7A899970" />}
            onClose={() => props.onClose()}
            showButton={false}
        >
            After confirmation, checking usually takes some time.
        </ActionModal>
    );
};

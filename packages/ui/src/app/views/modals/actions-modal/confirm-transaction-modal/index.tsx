import { Component } from 'solid-js';
import { ActionModal } from 'src/app/views/modals/actions-modal/action-modal';
import { Identifiable } from 'src/app/models/identifiable';
import { LoaderIcon } from 'src/app/components';

interface ConfirmTransactionModalProps extends Identifiable {
    onClose: () => void;
}

export const ConfirmTransactionModal: Component<ConfirmTransactionModalProps> = props => {
    return (
        <ActionModal
            headerTranslationKey="actionModal.confirmTransaction.header"
            textTranslationKey="actionModal.confirmTransaction.text"
            icon={<LoaderIcon size="m" />}
            onClose={() => props.onClose()}
            showButton={false}
            id={props.id}
        />
    );
};

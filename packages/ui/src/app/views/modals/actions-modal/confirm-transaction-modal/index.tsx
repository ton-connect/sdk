import { Component } from 'solid-js';
import { ActionModal } from 'src/app/views/modals/actions-modal/action-modal';
import { LoaderIcon } from 'src/app/components';

interface ConfirmTransactionModalProps {
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
            data-tc-confirm-modal="true"
        />
    );
};

import { Component } from 'solid-js';
import { ActionModal } from 'src/app/views/modals/actions-modal/action-modal';
import { ErrorIcon } from 'src/app/components';

interface SignDataCanceledModalProps {
    onClose: () => void;
}

export const SignDataCanceledModal: Component<SignDataCanceledModalProps> = props => {
    return (
        <ActionModal
            headerTranslationKey="actionModal.signDataCanceled.header"
            icon={<ErrorIcon size="m" />}
            onClose={() => props.onClose()}
            data-tc-sign-data-canceled-modal="true"
        />
    );
};

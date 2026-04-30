import { Component } from 'solid-js';
import { ActionModal } from 'src/app/views/modals/actions-modal/action-modal';
import { ErrorIcon } from 'src/app/components';

interface SignMessageCanceledModalProps {
    onClose: () => void;
}

export const SignMessageCanceledModal: Component<SignMessageCanceledModalProps> = props => {
    return (
        <ActionModal
            headerTranslationKey="actionModal.signMessageCanceled.header"
            icon={<ErrorIcon size="m" />}
            onClose={() => props.onClose()}
            data-tc-sign-message-canceled-modal="true"
        />
    );
};

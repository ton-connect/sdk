import { Component } from 'solid-js';
import { ActionModal } from 'src/app/views/modals/actions-modal/action-modal';
import { SuccessIcon } from 'src/app/components';

interface MessageSignedModalProps {
    onClose: () => void;
}

export const MessageSignedModal: Component<MessageSignedModalProps> = props => {
    return (
        <ActionModal
            headerTranslationKey="actionModal.messageSigned.header"
            icon={<SuccessIcon size="m" />}
            onClose={() => props.onClose()}
            data-tc-message-signed-modal="true"
        />
    );
};

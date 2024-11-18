import { Component } from 'solid-js';
import { ActionModal } from 'src/app/views/modals/actions-modal/action-modal';
import { SuccessIcon } from 'src/app/components';

interface SignDataSentModalProps {
    onClose: () => void;
}

export const SignDataSentModal: Component<SignDataSentModalProps> = props => {
    return (
        <ActionModal
            headerTranslationKey="actionModal.signDataSent.header"
            textTranslationKey="actionModal.signDataSent.text"
            icon={<SuccessIcon size="m" />}
            onClose={() => props.onClose()}
            data-tc-transaction-sent-modal="true"
        />
    );
};

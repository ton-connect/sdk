import { Component } from 'solid-js';
import { ActionModal } from 'src/app/views/modals/actions-modal/action-modal';
import { SuccessIcon } from 'src/app/components';
import { action } from 'src/app/state/modals-state';

interface SuccessModalProps {
    onClose: () => void;
}

export const SuccessModal: Component<SuccessModalProps> = props => {
    const currentAction = action();

    const { headerTranslationKey, textTranslationKey, showButton, dataAttrs } = (() => {
        const isIntent = currentAction?.isIntent;

        switch (currentAction?.name) {
            case 'transaction-sent':
                return {
                    headerTranslationKey: isIntent
                        ? 'actionModal.intentTransactionSent.header'
                        : 'actionModal.transactionSent.header',
                    textTranslationKey: isIntent
                        ? 'actionModal.intentTransactionSent.text'
                        : 'actionModal.transactionSent.text',
                    showButton: 'open-wallet',
                    dataAttrs: { 'data-tc-transaction-sent-modal': 'true' }
                };
            case 'data-signed':
                return {
                    headerTranslationKey: isIntent
                        ? 'actionModal.intentDataSigned.header'
                        : 'actionModal.dataSigned.header',
                    dataAttrs: { 'data-tc-data-signed-modal': 'true' }
                };
            case 'message-signed':
                return {
                    headerTranslationKey: isIntent
                        ? 'actionModal.intentMessageSigned.header'
                        : 'actionModal.messageSigned.header',
                    dataAttrs: { 'data-tc-message-signed-modal': 'true' }
                };
            case 'action-sent':
                return {
                    headerTranslationKey: isIntent
                        ? 'actionModal.intentActionSent.header'
                        : 'actionModal.actionSent.header',
                    textTranslationKey: isIntent
                        ? 'actionModal.intentActionSent.text'
                        : 'actionModal.actionSent.text',
                    showButton: 'open-wallet',
                    dataAttrs: { 'data-tc-action-sent-modal': 'true' }
                };
            default:
                return {
                    headerTranslationKey: 'actionModal.transactionSent.header',
                    textTranslationKey: 'actionModal.transactionSent.text',
                    showButton: 'open-wallet'
                };
        }
    })();

    const typedShowButton = showButton as 'open-wallet' | 'close' | undefined;

    return (
        <ActionModal
            headerTranslationKey={headerTranslationKey}
            textTranslationKey={textTranslationKey}
            icon={<SuccessIcon size="m" />}
            showButton={typedShowButton}
            onClose={() => props.onClose()}
            {...dataAttrs}
        />
    );
};

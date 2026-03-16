import { Component } from 'solid-js';
import { ActionModal } from 'src/app/views/modals/actions-modal/action-modal';
import { ErrorIcon } from 'src/app/components';
import { action } from 'src/app/state/modals-state';

interface CanceledModalProps {
    onClose: () => void;
}

export const CanceledModal: Component<CanceledModalProps> = props => {
    const currentAction = action();

    const { headerTranslationKey, textTranslationKey, dataAttrs } = (() => {
        const isIntent = currentAction?.isIntent;

        switch (currentAction?.name) {
            case 'transaction-canceled':
                return {
                    headerTranslationKey: isIntent
                        ? 'actionModal.intentTransactionCanceled.header'
                        : 'actionModal.transactionCanceled.header',
                    textTranslationKey: isIntent
                        ? 'actionModal.intentTransactionCanceled.text'
                        : 'actionModal.transactionCanceled.text',
                    dataAttrs: { 'data-tc-transaction-canceled-modal': 'true' }
                };
            case 'sign-data-canceled':
                return {
                    headerTranslationKey: isIntent
                        ? 'actionModal.intentSignDataCanceled.header'
                        : 'actionModal.signDataCanceled.header',
                    dataAttrs: { 'data-tc-sign-data-canceled-modal': 'true' }
                };
            case 'sign-message-canceled':
                return {
                    headerTranslationKey: isIntent
                        ? 'actionModal.intentSignMessageCanceled.header'
                        : 'actionModal.signMessageCanceled.header',
                    textTranslationKey: isIntent
                        ? 'actionModal.intentSignMessageCanceled.text'
                        : 'actionModal.signMessageCanceled.text',
                    dataAttrs: { 'data-tc-sign-message-canceled-modal': 'true' }
                };
            default:
                return {
                    headerTranslationKey: 'actionModal.transactionCanceled.header',
                    textTranslationKey: 'actionModal.transactionCanceled.text'
                };
        }
    })();

    return (
        <ActionModal
            headerTranslationKey={headerTranslationKey}
            textTranslationKey={textTranslationKey}
            icon={<ErrorIcon size="m" />}
            onClose={() => props.onClose()}
            {...dataAttrs}
        />
    );
};

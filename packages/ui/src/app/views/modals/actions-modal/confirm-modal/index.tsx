import { Component, useContext } from 'solid-js';
import { ActionModal } from 'src/app/views/modals/actions-modal/action-modal';
import { LoaderIcon } from 'src/app/components';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { useI18n } from '@solid-primitives/i18n';
import { action } from 'src/app/state/modals-state';

interface ConfirmModalProps {
    onClose: () => void;
}

export const ConfirmModal: Component<ConfirmModalProps> = props => {
    const tonConnectUI = useContext(TonConnectUiContext);
    const [t] = useI18n();

    const name = (): string =>
        tonConnectUI?.wallet && 'name' in tonConnectUI.wallet
            ? tonConnectUI.wallet.name
            : t('common.yourWallet', {}, 'Your wallet');

    const currentAction = action();

    const { headerTranslationKey, textTranslationKey, headerTranslationValues, dataAttrs } =
        (() => {
            switch (currentAction?.name) {
                case 'confirm-transaction':
                    return {
                        headerTranslationKey: 'actionModal.confirmTransaction.header',
                        textTranslationKey: 'actionModal.confirmTransaction.text',
                        headerTranslationValues: { name: name() },
                        dataAttrs: { 'data-tc-confirm-modal': 'true' }
                    };
                case 'confirm-sign-data':
                    return {
                        headerTranslationKey: 'actionModal.signData.header',
                        textTranslationKey: 'actionModal.signData.text',
                        headerTranslationValues: { name: name() },
                        dataAttrs: { 'data-tc-sign-data-confirm-modal': 'true' }
                    };
                case 'confirm-sign-message':
                    return {
                        headerTranslationKey: 'actionModal.signMessage.header',
                        textTranslationKey: 'actionModal.signMessage.text',
                        headerTranslationValues: { name: name() },
                        dataAttrs: { 'data-tc-sign-message-confirm-modal': 'true' }
                    };
                case 'confirm-action':
                    return {
                        headerTranslationKey: 'actionModal.confirmAction.header',
                        textTranslationKey: 'actionModal.confirmAction.text',
                        headerTranslationValues: { name: name() },
                        dataAttrs: { 'data-tc-confirm-action-modal': 'true' }
                    };
                default:
                    return {
                        headerTranslationKey: 'actionModal.confirmTransaction.header',
                        textTranslationKey: 'actionModal.confirmTransaction.text',
                        headerTranslationValues: { name: name() }
                    };
            }
        })();

    return (
        <ActionModal
            headerTranslationKey={headerTranslationKey}
            headerTranslationValues={headerTranslationValues}
            textTranslationKey={textTranslationKey}
            icon={<LoaderIcon size="m" />}
            onClose={() => props.onClose()}
            showButton="open-wallet"
            {...dataAttrs}
        />
    );
};

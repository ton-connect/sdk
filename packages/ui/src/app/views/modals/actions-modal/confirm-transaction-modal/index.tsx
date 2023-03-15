import { Component, useContext } from 'solid-js';
import { ActionModal } from 'src/app/views/modals/actions-modal/action-modal';
import { LoaderIcon } from 'src/app/components';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { useI18n } from '@solid-primitives/i18n';

interface ConfirmTransactionModalProps {
    onClose: () => void;
}

export const ConfirmTransactionModal: Component<ConfirmTransactionModalProps> = props => {
    const tonConnectUI = useContext(TonConnectUiContext);
    const [t] = useI18n();
    const name = tonConnectUI!.wallet?.name || t('common.yourWallet', {}, 'your wallet');

    return (
        <ActionModal
            headerTranslationKey="actionModal.confirmTransaction.header"
            headerTranslationValues={{ name }}
            textTranslationKey="actionModal.confirmTransaction.text"
            icon={<LoaderIcon size="m" />}
            onClose={() => props.onClose()}
            showButton={false}
            data-tc-confirm-modal="true"
        />
    );
};

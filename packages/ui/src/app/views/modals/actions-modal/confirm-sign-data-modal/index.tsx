import { Component, useContext } from 'solid-js';
import { ActionModal } from 'src/app/views/modals/actions-modal/action-modal';
import { WaitingWalletIcon } from 'src/app/views/modals/actions-modal/waiting-wallet-icon';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { useI18n } from '@solid-primitives/i18n';
import { stripWalletNameNote } from 'src/app/utils/wallets';

interface ConfirmSignDataModalProps {
    onClose: () => void;
}

export const ConfirmSignDataModal: Component<ConfirmSignDataModalProps> = props => {
    const tonConnectUI = useContext(TonConnectUiContext);
    const [t] = useI18n();
    const name = (): string =>
        tonConnectUI!.wallet && 'name' in tonConnectUI!.wallet
            ? stripWalletNameNote(tonConnectUI!.wallet.name)
            : t('common.yourWallet', {}, 'Your wallet');

    return (
        <ActionModal
            headerTranslationKey="actionModal.signData.header"
            headerTranslationValues={{ name: name() }}
            textTranslationKey="actionModal.signData.text"
            icon={<WaitingWalletIcon />}
            onClose={() => props.onClose()}
            showButton="open-wallet"
            data-tc-sign-data-confirm-modal="true"
        />
    );
};

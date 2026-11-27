import { Component, useContext } from 'solid-js';
import { Notification } from 'src/app/components/notification';
import { Styleable } from 'src/app/models/styleable';
import { LoaderIconStyled } from 'src/app/views/account-button/notifications/confirm-transaction-notification/style';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { useI18n } from '@solid-primitives/i18n';
import { stripWalletNameNote } from 'src/app/utils/wallets';

interface ConfirmSignDataNotificationProps extends Styleable {}

export const ConfirmSignDataNotification: Component<ConfirmSignDataNotificationProps> = props => {
    const tonConnectUI = useContext(TonConnectUiContext);
    const [t] = useI18n();
    const name = (): string =>
        tonConnectUI!.wallet && 'name' in tonConnectUI!.wallet
            ? stripWalletNameNote(tonConnectUI!.wallet.name)
            : t('common.yourWallet', {}, 'Your wallet');

    return (
        <Notification
            header={{
                translationKey: 'notifications.confirmSignData.header',
                translationValues: { name: name() }
            }}
            class={props.class}
            icon={<LoaderIconStyled />}
            data-tc-notification-confirm-sign-data="true"
        >
            Confirm data signing in your wallet
        </Notification>
    );
};

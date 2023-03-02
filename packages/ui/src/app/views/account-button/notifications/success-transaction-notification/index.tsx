import { Component } from 'solid-js';
import { Notification } from 'src/app/components/notification';
import { Styleable } from 'src/app/models/styleable';
import { SuccessIconStyled } from 'src/app/views/account-button/notifications/success-transaction-notification/style';

interface SuccessTransactionNotificationProps extends Styleable {}

export const SuccessTransactionNotification: Component<
    SuccessTransactionNotificationProps
> = props => {
    return (
        <Notification
            header={{ translationKey: 'notifications.transactionSent.header' }}
            text={{ translationKey: 'notifications.transactionSent.text' }}
            icon={<SuccessIconStyled />}
            class={props.class}
            data-tc-notification-tx-sent="true"
        >
            Transaction sent
        </Notification>
    );
};

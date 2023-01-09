import { Component } from 'solid-js';
import { Notification } from 'src/app/components/notification';
import { Styleable } from 'src/app/models/styleable';
import { SuccessIconStyled } from 'src/app/views/account-button/notifications/success-transaction-notification/style';
import cn from 'classnames';

interface SuccessTransactionNotificationProps extends Styleable {}

export const SuccessTransactionNotification: Component<
    SuccessTransactionNotificationProps
> = props => {
    return (
        <Notification
            header={{ translationKey: 'notifications.transactionSent.header' }}
            text={{ translationKey: 'notifications.transactionSent.text' }}
            icon={<SuccessIconStyled />}
            class={cn(props.class, 'tc-notification')}
        >
            Transaction sent
        </Notification>
    );
};

import { Component } from 'solid-js';
import { Notification } from 'src/app/components/notification';
import { Styleable } from 'src/app/models/styleable';
import { ErrorIconStyled } from './style';

interface ErrorTransactionNotificationProps extends Styleable {}

export const ErrorTransactionNotification: Component<ErrorTransactionNotificationProps> = props => {
    return (
        <Notification
            header={{ translationKey: 'notifications.transactionCanceled.header' }}
            text={{ translationKey: 'notifications.transactionCanceled.text' }}
            icon={<ErrorIconStyled size="xs" />}
            class={props.class}
            data-tc-notification-tx-cancelled="true"
        >
            Transaction cancelled
        </Notification>
    );
};

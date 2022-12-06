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
            text="It will take a few seconds until it is confirmed by the network"
            icon={<SuccessIconStyled />}
            class={props.class}
        >
            Transaction sent
        </Notification>
    );
};

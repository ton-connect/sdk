import { Component } from 'solid-js';
import { Notification } from 'src/app/components/notification';
import { SuccessIconStyled } from 'src/app/views/account-button/notifications/success-transaction-notification/style';

interface SuccessTransactionNotificationProps {}

export const SuccessTransactionNotification: Component<
    SuccessTransactionNotificationProps
> = () => {
    return (
        <Notification
            text="It will take a few seconds until it is confirmed by the network"
            icon={<SuccessIconStyled />}
        >
            Transaction sent
        </Notification>
    );
};

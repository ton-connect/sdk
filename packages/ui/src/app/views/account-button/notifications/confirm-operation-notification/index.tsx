import { Component } from 'solid-js';
import { Notification } from 'src/app/components/notification';
import { LoaderIconStyled } from 'src/app/views/account-button/notifications/confirm-operation-notification/style';

interface ConfirmOperationNotificationProps {}

export const ConfirmOperationNotification: Component<ConfirmOperationNotificationProps> = () => {
    return (
        <Notification icon={<LoaderIconStyled />}>Confirm operation in your wallet</Notification>
    );
};

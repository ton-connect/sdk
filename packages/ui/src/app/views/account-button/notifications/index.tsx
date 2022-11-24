import { Component } from 'solid-js';
import { ConfirmOperationNotification } from 'src/app/views/account-button/notifications/confirm-operation-notification';
import { ErrorTransactionNotification } from 'src/app/views/account-button/notifications/error-transaction-notification';
import { SuccessTransactionNotification } from 'src/app/views/account-button/notifications/success-transaction-notification';
import { NotificationsStyled } from './style';

interface NotificationsProps {}

export const Notifications: Component<NotificationsProps> = () => {
    return (
        <NotificationsStyled>
            <SuccessTransactionNotification />
            <ErrorTransactionNotification />
            <ConfirmOperationNotification />
        </NotificationsStyled>
    );
};

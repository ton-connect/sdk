import { Component } from 'solid-js';
import { Notification } from 'src/app/components/notification';
import { ErrorIconStyled } from './style';

interface ErrorTransactionNotificationProps {}

export const ErrorTransactionNotification: Component<ErrorTransactionNotificationProps> = () => {
    return (
        <Notification
            text="The transaction was canceled because there were no expected changes in the blockchain."
            icon={<ErrorIconStyled />}
        >
            Transaction cancelled
        </Notification>
    );
};

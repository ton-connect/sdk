import { Component } from 'solid-js';
import { Notification } from 'src/app/components/notification';
import { Styleable } from 'src/app/models/styleable';
import { ErrorIconStyled } from './style';

interface ErrorTransactionNotificationProps extends Styleable {}

export const ErrorTransactionNotification: Component<ErrorTransactionNotificationProps> = props => {
    return (
        <Notification
            text="The transaction was canceled because there were no expected changes in the blockchain."
            icon={<ErrorIconStyled />}
            class={props.class}
        >
            Transaction cancelled
        </Notification>
    );
};

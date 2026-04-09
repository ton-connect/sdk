import { Component } from 'solid-js';
import { Notification } from 'src/app/components/notification';
import { Styleable } from 'src/app/models/styleable';
import { ErrorIconStyled } from './style';

interface ErrorSignMessageNotificationProps extends Styleable {}

export const ErrorSignMessageNotification: Component<ErrorSignMessageNotificationProps> = props => {
    return (
        <Notification
            header={{ translationKey: 'notifications.signMessageCanceled.header' }}
            icon={<ErrorIconStyled size="xs" />}
            class={props.class}
            data-tc-notification-sign-message-cancelled="true"
        >
            Sign message canceled
        </Notification>
    );
};

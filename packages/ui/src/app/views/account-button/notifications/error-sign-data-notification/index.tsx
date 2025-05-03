import { Component } from 'solid-js';
import { Notification } from 'src/app/components/notification';
import { Styleable } from 'src/app/models/styleable';
import { ErrorIconStyled } from './style';

interface ErrorSignDataNotificationProps extends Styleable {}

export const ErrorSignDataNotification: Component<ErrorSignDataNotificationProps> = props => {
    return (
        <Notification
            header={{ translationKey: 'notifications.signDataCanceled.header' }}
            icon={<ErrorIconStyled size="xs" />}
            class={props.class}
            data-tc-notification-sign-data-cancelled="true"
        >
            Sign data canceled
        </Notification>
    );
};

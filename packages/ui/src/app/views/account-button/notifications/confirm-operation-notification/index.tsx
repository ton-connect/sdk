import { Component } from 'solid-js';
import { Notification } from 'src/app/components/notification';
import { Styleable } from 'src/app/models/styleable';
import { LoaderIconStyled } from 'src/app/views/account-button/notifications/confirm-operation-notification/style';

interface ConfirmOperationNotificationProps extends Styleable {}

export const ConfirmOperationNotification: Component<ConfirmOperationNotificationProps> = props => {
    return (
        <Notification
            header={{ translationKey: 'notifications.confirm.header' }}
            class={props.class}
            icon={<LoaderIconStyled />}
        >
            Confirm operation in your wallet
        </Notification>
    );
};

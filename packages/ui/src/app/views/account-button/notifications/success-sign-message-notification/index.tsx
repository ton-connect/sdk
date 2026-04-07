import { Component } from 'solid-js';
import { Notification } from 'src/app/components/notification';
import { Styleable } from 'src/app/models/styleable';
import { SuccessIconStyled } from 'src/app/views/account-button/notifications/success-transaction-notification/style';

interface SuccessSignMessageNotificationProps extends Styleable {}

export const SuccessSignMessageNotification: Component<
    SuccessSignMessageNotificationProps
> = props => {
    return (
        <Notification
            header={{ translationKey: 'notifications.messageSigned.header' }}
            icon={<SuccessIconStyled />}
            class={props.class}
            data-tc-notification-message-signed="true"
        >
            Message signed
        </Notification>
    );
};

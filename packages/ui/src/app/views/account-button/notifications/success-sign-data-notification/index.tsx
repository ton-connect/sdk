import { Component } from 'solid-js';
import { Notification } from 'src/app/components/notification';
import { Styleable } from 'src/app/models/styleable';
import { SuccessIconStyled } from 'src/app/views/account-button/notifications/success-transaction-notification/style';

interface SuccessSignDataNotificationProps extends Styleable {}

export const SuccessSignDataNotification: Component<SuccessSignDataNotificationProps> = props => {
    return (
        <Notification
            header={{ translationKey: 'notifications.dataSigned.header' }}
            icon={<SuccessIconStyled />}
            class={props.class}
            data-tc-notification-data-signed="true"
        >
            Data signed
        </Notification>
    );
};

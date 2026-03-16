import { Component } from 'solid-js';
import { Notification } from 'src/app/components/notification';
import { Styleable } from 'src/app/models/styleable';
import { action } from 'src/app/state/modals-state';
import { ErrorIconStyled } from 'src/app/views/account-button/notifications/error-transaction-notification/style';

interface ErrorNotificationProps extends Styleable {}

export const ErrorNotification: Component<ErrorNotificationProps> = props => {
    const currentAction = action();

    const { header, text, dataAttrs } = (() => {
        const isIntent = currentAction?.isIntent;

        switch (currentAction?.name) {
            case 'transaction-canceled':
                return {
                    header: {
                        translationKey: isIntent
                            ? 'notifications.intent.transactionCanceled.header'
                            : 'notifications.transactionCanceled.header'
                    },
                    text: {
                        translationKey: isIntent
                            ? 'notifications.intent.transactionCanceled.text'
                            : 'notifications.transactionCanceled.text'
                    },
                    dataAttrs: { 'data-tc-notification-tx-cancelled': 'true' }
                };
            case 'sign-data-canceled':
                return {
                    header: {
                        translationKey: isIntent
                            ? 'notifications.intent.signDataCanceled.header'
                            : 'notifications.signDataCanceled.header'
                    },
                    dataAttrs: { 'data-tc-notification-sign-data-cancelled': 'true' }
                };
            case 'sign-message-canceled':
                return {
                    header: {
                        translationKey: isIntent
                            ? 'notifications.intent.signMessageCanceled.header'
                            : 'notifications.signMessageCanceled.header'
                    },
                    dataAttrs: { 'data-tc-notification-sign-message-cancelled': 'true' }
                };
            default:
                return {
                    header: { translationKey: 'notifications.transactionCanceled.header' },
                    text: { translationKey: 'notifications.transactionCanceled.text' }
                };
        }
    })();

    return (
        <Notification
            header={header}
            text={text}
            icon={<ErrorIconStyled size="xs" />}
            class={props.class}
            {...dataAttrs}
        >
            Transaction cancelled
        </Notification>
    );
};

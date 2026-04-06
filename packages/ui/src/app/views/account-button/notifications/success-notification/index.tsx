import { Component } from 'solid-js';
import { Notification } from 'src/app/components/notification';
import { Styleable } from 'src/app/models/styleable';
import { action } from 'src/app/state/modals-state';
import { SuccessIconStyled } from 'src/app/views/account-button/notifications/success-transaction-notification/style';

interface SuccessNotificationProps extends Styleable {}

export const SuccessNotification: Component<SuccessNotificationProps> = props => {
    const currentAction = action();

    const { header, text, dataAttrs } = (() => {
        const isIntent = currentAction?.isIntent;

        switch (currentAction?.name) {
            case 'transaction-sent':
                return {
                    header: {
                        translationKey: isIntent
                            ? 'notifications.intent.transactionSent.header'
                            : 'notifications.transactionSent.header'
                    },
                    text: {
                        translationKey: isIntent
                            ? 'notifications.intent.transactionSent.text'
                            : 'notifications.transactionSent.text'
                    },
                    dataAttrs: { 'data-tc-notification-tx-sent': 'true' }
                };
            case 'data-signed':
                return {
                    header: {
                        translationKey: isIntent
                            ? 'notifications.intent.dataSigned.header'
                            : 'notifications.dataSigned.header'
                    },
                    dataAttrs: { 'data-tc-notification-data-signed': 'true' }
                };
            case 'message-signed':
                return {
                    header: {
                        translationKey: isIntent
                            ? 'notifications.intent.messageSigned.header'
                            : 'notifications.messageSigned.header'
                    },
                    dataAttrs: { 'data-tc-notification-message-signed': 'true' }
                };
            case 'action-sent':
                return {
                    header: {
                        translationKey: isIntent
                            ? 'notifications.intent.actionSent.header'
                            : 'notifications.actionSent.header'
                    },
                    text: {
                        translationKey: isIntent
                            ? 'notifications.intent.actionSent.text'
                            : 'notifications.actionSent.text'
                    },
                    dataAttrs: { 'data-tc-notification-action-sent': 'true' }
                };
            default:
                return {
                    header: { translationKey: 'notifications.transactionSent.header' },
                    text: { translationKey: 'notifications.transactionSent.text' }
                };
        }
    })();

    return (
        <Notification
            header={header}
            text={text}
            icon={<SuccessIconStyled />}
            class={props.class}
            {...dataAttrs}
        >
            Transaction sent
        </Notification>
    );
};

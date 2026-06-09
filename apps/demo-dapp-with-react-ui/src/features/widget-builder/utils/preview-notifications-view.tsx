// @ts-nocheck
/**
 * Demo-only patch: notification list without enter/exit transitions (prevents two toasts during swap).
 */
import { Component, For, Match, Switch } from 'solid-js';
import { ConfirmTransactionNotification } from 'src/app/views/account-button/notifications/confirm-transaction-notification';
import { ConfirmSignDataNotification } from 'src/app/views/account-button/notifications/confirm-sign-data-notification';
import { ConfirmSignMessageNotification } from 'src/app/views/account-button/notifications/confirm-sign-message-notification';
import { ErrorTransactionNotification } from 'src/app/views/account-button/notifications/error-transaction-notification';
import { SuccessTransactionNotification } from 'src/app/views/account-button/notifications/success-transaction-notification';
import { NotificationClass } from 'src/app/views/account-button/notifications/style';
import { Styleable } from 'src/app/models/styleable';
import { useOpenedNotifications } from 'src/app/hooks/use-notifications';
import {
    confirmActionNames,
    errorActionNames,
    successActionNames
} from 'src/app/state/modals-state';
import { ErrorSignDataNotification } from 'src/app/views/account-button/notifications/error-sign-data-notification';
import { SuccessSignDataNotification } from 'src/app/views/account-button/notifications/success-sign-data-notification';
import { SuccessSignMessageNotification } from 'src/app/views/account-button/notifications/success-sign-message-notification';
import { ErrorSignMessageNotification } from 'src/app/views/account-button/notifications/error-sign-message-notification';

export interface NotificationsProps extends Styleable {}

export const Notifications: Component<NotificationsProps> = props => {
    const openedNotifications = useOpenedNotifications();

    return (
        <div class={props.class} data-tc-list-notifications="true">
            <For each={openedNotifications()}>
                {({ action }) => (
                    <Switch>
                        <Match when={action.name === successActionNames.sendTransaction}>
                            <SuccessTransactionNotification class={NotificationClass} />
                        </Match>
                        <Match when={action.name === errorActionNames.sendTransaction}>
                            <ErrorTransactionNotification class={NotificationClass} />
                        </Match>
                        <Match when={action.name === successActionNames.signData}>
                            <SuccessSignDataNotification class={NotificationClass} />
                        </Match>
                        <Match when={action.name === successActionNames.signMessage}>
                            <SuccessSignMessageNotification class={NotificationClass} />
                        </Match>
                        <Match when={action.name === errorActionNames.signData}>
                            <ErrorSignDataNotification class={NotificationClass} />
                        </Match>
                        <Match when={action.name === errorActionNames.signMessage}>
                            <ErrorSignMessageNotification class={NotificationClass} />
                        </Match>
                        <Match when={action.name === confirmActionNames.sendTransaction}>
                            <ConfirmTransactionNotification class={NotificationClass} />
                        </Match>
                        <Match when={action.name === confirmActionNames.signData}>
                            <ConfirmSignDataNotification class={NotificationClass} />
                        </Match>
                        <Match when={action.name === confirmActionNames.signMessage}>
                            <ConfirmSignMessageNotification class={NotificationClass} />
                        </Match>
                    </Switch>
                )}
            </For>
        </div>
    );
};

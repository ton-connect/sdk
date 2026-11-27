import { Component, For, Match, Switch } from 'solid-js';
import { TransitionGroup } from 'solid-transition-group';
import { ConfirmTransactionNotification } from './confirm-transaction-notification';
import { ConfirmSignDataNotification } from './confirm-sign-data-notification';
import { ConfirmSignMessageNotification } from './confirm-sign-message-notification';
import { ErrorTransactionNotification } from './error-transaction-notification';
import { SuccessTransactionNotification } from './success-transaction-notification';
import { NotificationClass } from './style';
import { Styleable } from 'src/app/models/styleable';
import { useOpenedNotifications } from 'src/app/hooks/use-notifications';
import {
    confirmActionNames,
    errorActionNames,
    successActionNames
} from 'src/app/state/modals-state';
import { animate } from 'src/app/utils/animate';
import { ErrorSignDataNotification } from './error-sign-data-notification';
import { SuccessSignDataNotification } from './success-sign-data-notification';
import { SuccessSignMessageNotification } from './success-sign-message-notification';
import { ErrorSignMessageNotification } from './error-sign-message-notification';
import { EASE_STANDARD } from 'src/app/styles/motion';

export interface NotificationsProps extends Styleable {}

export const Notifications: Component<NotificationsProps> = props => {
    const openedNotifications = useOpenedNotifications();

    return (
        <div class={props.class} data-tc-list-notifications="true">
            <TransitionGroup
                onBeforeEnter={el => {
                    animate(
                        el,
                        [
                            { opacity: 0, transform: 'translateY(0)' },
                            { opacity: 1, transform: 'translateY(-8px)' }
                        ],
                        {
                            duration: 260,
                            easing: EASE_STANDARD
                        }
                    );
                }}
                onExit={(el, done) => {
                    const a = animate(
                        el,
                        [
                            { opacity: 1, transform: 'translateY(-8px)' },
                            { opacity: 0, transform: 'translateY(-30px)' }
                        ],
                        {
                            duration: 260,
                            easing: EASE_STANDARD
                        }
                    );
                    a.finished.then(done);
                }}
            >
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
            </TransitionGroup>
        </div>
    );
};

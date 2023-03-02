import { Component, createEffect, createSignal, For, Match, on, onCleanup, Switch } from 'solid-js';
import { TransitionGroup } from 'solid-transition-group';
import { ActionName, action } from 'src/app/state/modals-state';
import { ConfirmOperationNotification } from './confirm-operation-notification';
import { ErrorTransactionNotification } from './error-transaction-notification';
import { SuccessTransactionNotification } from './success-transaction-notification';
import { NotificationClass } from './style';
import { Styleable } from 'src/app/models/styleable';

export interface NotificationsProps extends Styleable {}

export const Notifications: Component<NotificationsProps> = props => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const [openedNotifications, setOpenedNotifications] = createSignal<
        { id: number; action: ActionName }[]
    >([]);

    let lastId = -1;
    const liveTimeoutMs = 4500;

    createEffect(
        on(action, action => {
            if (action && action.showNotification) {
                lastId++;
                const id = lastId;

                setOpenedNotifications(notifications =>
                    notifications
                        .filter(notification => notification.action !== 'confirm-transaction')
                        .concat({ id, action: action.name })
                );
                timeouts.push(
                    setTimeout(
                        () =>
                            setOpenedNotifications(notifications =>
                                notifications.filter(notification => notification.id !== id)
                            ),
                        liveTimeoutMs
                    )
                );
            }
        })
    );

    onCleanup(() => {
        timeouts.forEach(clearTimeout);
    });

    return (
        <div class={props.class} data-tc-list-notifications="true">
            <TransitionGroup
                onBeforeEnter={el => {
                    el.animate(
                        [
                            { opacity: 0, transform: 'translateY(0)' },
                            { opacity: 1, transform: 'translateY(-8px)' }
                        ],
                        {
                            duration: 200
                        }
                    );
                }}
                onExit={(el, done) => {
                    const a = el.animate(
                        [
                            { opacity: 1, transform: 'translateY(-8px)' },
                            { opacity: 0, transform: 'translateY(-30px)' }
                        ],
                        {
                            duration: 200
                        }
                    );
                    a.finished.then(done);
                }}
            >
                <For each={openedNotifications()}>
                    {openedNotification => (
                        <Switch>
                            <Match when={openedNotification.action === 'transaction-sent'}>
                                <SuccessTransactionNotification class={NotificationClass} />
                            </Match>
                            <Match when={openedNotification.action === 'transaction-canceled'}>
                                <ErrorTransactionNotification class={NotificationClass} />
                            </Match>
                            <Match when={openedNotification.action === 'confirm-transaction'}>
                                <ConfirmOperationNotification class={NotificationClass} />
                            </Match>
                        </Switch>
                    )}
                </For>
            </TransitionGroup>
        </div>
    );
};

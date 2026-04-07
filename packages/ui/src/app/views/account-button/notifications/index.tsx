import { Component, For, Match, Switch } from 'solid-js';
import { TransitionGroup } from 'solid-transition-group';
import { ConfirmNotification } from './confirm-notification';
import { ErrorNotification } from './error-notification';
import { SuccessNotification } from './success-notification';
import { NotificationClass } from './style';
import { Styleable } from 'src/app/models/styleable';
import { useOpenedNotifications } from 'src/app/hooks/use-notifications';
import { animate } from 'src/app/utils/animate';

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
                            duration: 200
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
                            duration: 200
                        }
                    );
                    a.finished.then(done);
                }}
            >
                <For each={openedNotifications()}>
                    {openedNotification => (
                        <Switch>
                            <Match
                                when={
                                    openedNotification.action === 'transaction-sent' ||
                                    openedNotification.action === 'data-signed' ||
                                    openedNotification.action === 'message-signed' ||
                                    openedNotification.action === 'action-sent'
                                }
                            >
                                <SuccessNotification class={NotificationClass} />
                            </Match>
                            <Match
                                when={
                                    openedNotification.action === 'transaction-canceled' ||
                                    openedNotification.action === 'sign-data-canceled' ||
                                    openedNotification.action === 'sign-message-canceled' ||
                                    openedNotification.action === 'action-canceled'
                                }
                            >
                                <ErrorNotification class={NotificationClass} />
                            </Match>
                            <Match
                                when={
                                    openedNotification.action === 'confirm-transaction' ||
                                    openedNotification.action === 'confirm-sign-data' ||
                                    openedNotification.action === 'confirm-sign-message' ||
                                    openedNotification.action === 'confirm-action'
                                }
                            >
                                <ConfirmNotification class={NotificationClass} />
                            </Match>
                        </Switch>
                    )}
                </For>
            </TransitionGroup>
        </div>
    );
};

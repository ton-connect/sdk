import { Accessor, createEffect, createSignal, on, onCleanup } from 'solid-js';
import { Action, action, ActionName } from 'src/app/state/modals-state';

type Notification = {
    action: ActionName;
};

/**
 * Hook for opened notifications.
 */
export type UseOpenedNotifications = Accessor<Notification[]>;

/**
 * Config for useOpenedNotifications hook.
 */
export type UseOpenedNotificationsConfig = {
    /**
     * Timeout in milliseconds after which the notification will be removed, default is 4500.
     */
    timeout?: number;
};

const defaultConfig: UseOpenedNotificationsConfig = {
    timeout: 4500
};

const [latestAction, setLatestAction] = createSignal<Action | null>(null);

export function useOpenedNotifications(
    config?: UseOpenedNotificationsConfig
): UseOpenedNotifications {
    const { timeout } = { ...defaultConfig, ...config };

    const [openedNotifications, setOpenedNotifications] = createSignal<Notification[]>([]);
    const [timeoutIds, setTimeoutIds] = createSignal<ReturnType<typeof setTimeout>[]>([]);

    createEffect(
        on(action, (action: Action | null): void => {
            // do nothing if action is null or should not show notification
            if (!action || !action.showNotification) {
                return;
            }

            // do nothing if action is the same as latest action
            if (latestAction() === action) {
                return;
            }
            if (
                latestAction()?.name === 'confirm-transaction' &&
                action.name === 'confirm-transaction'
            ) {
                return;
            }

            setLatestAction(action);

            // cleanup all not confirmed transactions
            setOpenedNotifications(openedNotifications =>
                openedNotifications.filter(n => n.action !== 'confirm-transaction')
            );

            // create notification
            const notification: Notification = { action: action.name };
            setOpenedNotifications(openedNotifications => [...openedNotifications, notification]);

            // remove notification after timeout
            const timeoutId = setTimeout(() => {
                setOpenedNotifications(openedNotifications =>
                    openedNotifications.filter(n => n !== notification)
                );
                setTimeoutIds(timeoutIds => timeoutIds.filter(id => id !== timeoutId));
            }, timeout);
            setTimeoutIds(timeoutIds => [...timeoutIds, timeoutId]);
        })
    );

    // cleanup all timeouts on unmount
    onCleanup(() => {
        timeoutIds().forEach(id => clearTimeout(id));
    });

    return openedNotifications;
}

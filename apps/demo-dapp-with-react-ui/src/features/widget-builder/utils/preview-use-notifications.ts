// @ts-nocheck
/**
 * Demo-only patch of @tonconnect/ui use-notifications.
 * Single-slot toasts: at most one notification in the list, replaced atomically on update.
 */
import { Accessor, createEffect, createSignal, on, onCleanup } from 'solid-js';
import { Action, action, isConfirmAction } from 'src/app/state/modals-state';

type Notification = {
    action: Action;
};

export type UseOpenedNotifications = Accessor<Notification[]>;

export type UseOpenedNotificationsConfig = {
    timeout?: number;
};

const defaultConfig: UseOpenedNotificationsConfig = {
    timeout: 9999999999
};

const [latestAction, setLatestAction] = createSignal<Action | null>(null);
const [openedNotifications, setOpenedNotifications] = createSignal<Notification[]>([]);
const [timeoutIds, setTimeoutIds] = createSignal<ReturnType<typeof setTimeout>[]>([]);

function clearNotificationTimeouts(): void {
    timeoutIds().forEach(id => clearTimeout(id));
    setTimeoutIds([]);
}

export function clearAllPreviewNotifications(): void {
    clearNotificationTimeouts();
    setLatestAction(null);
    setOpenedNotifications([]);
}

export function resetLatestNotificationAction(): void {
    setLatestAction(null);
}

function showSingleNotification(nextAction: Action, timeout: number): void {
    clearNotificationTimeouts();
    setLatestAction(nextAction);

    const notification: Notification = { action: nextAction };
    setOpenedNotifications([notification]);

    const timeoutId = setTimeout(() => {
        setOpenedNotifications(current => (current[0] === notification ? [] : current));
        setTimeoutIds(ids => ids.filter(id => id !== timeoutId));
    }, timeout);
    setTimeoutIds(ids => [...ids, timeoutId]);
}

export function useOpenedNotifications(
    config?: UseOpenedNotificationsConfig
): UseOpenedNotifications {
    const { timeout } = { ...defaultConfig, ...config };

    createEffect(
        on(action, (nextAction: Action | null): void => {
            if (!nextAction) {
                clearNotificationTimeouts();
                setLatestAction(null);
                setOpenedNotifications([]);
                return;
            }

            if (!nextAction.showNotification) {
                setOpenedNotifications(current =>
                    current.filter(notification => !isConfirmAction(notification.action))
                );
                return;
            }

            if (latestAction() === nextAction) {
                return;
            }

            const isDuplicateConfirmAction =
                latestAction()?.name === nextAction.name && isConfirmAction(nextAction);

            if (isDuplicateConfirmAction) {
                return;
            }

            showSingleNotification(nextAction, timeout);
        })
    );

    onCleanup(() => {
        clearNotificationTimeouts();
    });

    return openedNotifications;
}

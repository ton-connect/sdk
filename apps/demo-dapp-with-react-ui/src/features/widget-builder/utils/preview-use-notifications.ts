/**
 * Demo-only replacement of the @tonconnect/ui `use-notifications` hook, swapped in by the
 * `widget-preview-ui-overrides` vite plugin (see vite.config.ts) so the real notifications
 * view from @tonconnect/ui can be used as-is.
 * Single-slot toasts: at most one notification in the list, replaced atomically on update.
 */
import type { Accessor } from 'solid-js';
import { createEffect, createSignal, on, onCleanup } from 'solid-js';
import { action, isConfirmAction, type Action } from 'src/app/state/modals-state';

type Notification = {
    action: Action;
};

export type UseOpenedNotifications = Accessor<Notification[]>;

export type UseOpenedNotificationsConfig = {
    timeout?: number;
};

/** Preview toasts never auto-dismiss: they live until the preview replaces or clears them. */
const PREVIEW_NOTIFICATION_NO_TIMEOUT = Number.POSITIVE_INFINITY;

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

    if (!Number.isFinite(timeout)) {
        // No auto-dismiss: skip scheduling entirely (large delays overflow setTimeout).
        return;
    }

    const timeoutId = setTimeout(() => {
        setOpenedNotifications(current => (current[0] === notification ? [] : current));
        setTimeoutIds(ids => ids.filter(id => id !== timeoutId));
    }, timeout);
    setTimeoutIds(ids => [...ids, timeoutId]);
}

export function useOpenedNotifications(
    config?: UseOpenedNotificationsConfig
): UseOpenedNotifications {
    const timeout = config?.timeout ?? PREVIEW_NOTIFICATION_NO_TIMEOUT;

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

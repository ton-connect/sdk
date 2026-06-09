import type { TonConnectUI } from '@tonconnect/ui-react';
// @ts-expect-error resolved via demo vite alias to @tonconnect/ui source
import { setAction } from 'src/app/state/modals-state';

import { setPreviewConnectedWallet } from './preview-mocks';
import {
    clearAllPreviewNotifications,
    resetLatestNotificationAction
} from './preview-use-notifications';

const CLEAR_ACTION_WAIT_MS = 100;

function wait(ms: number): Promise<void> {
    return new Promise(resolve => {
        window.setTimeout(resolve, ms);
    });
}

/** Resets dedupe guard before the next preview toast (keeps current toast until replaced). */
export async function resetNotificationPreviewDedupe(): Promise<void> {
    resetLatestNotificationAction();
    await wait(0);
}

/** Full reset when tearing down preview (disconnect / settings reload). */
export async function resetNotificationPreviewGuard(): Promise<void> {
    clearAllPreviewNotifications();
    setAction(null);
    await wait(CLEAR_ACTION_WAIT_MS);
}

/** Lighter reset for hanging "before" previews — keeps wallet connected. */
export async function prepareBeforeNotificationRefresh(tonConnectUI: TonConnectUI): Promise<void> {
    await resetNotificationPreviewDedupe();
    setPreviewConnectedWallet(tonConnectUI.connector);
    await wait(CLEAR_ACTION_WAIT_MS);
}

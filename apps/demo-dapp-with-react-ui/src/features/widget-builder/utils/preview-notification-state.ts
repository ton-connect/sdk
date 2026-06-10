import { resetLatestNotificationAction } from './preview-use-notifications';

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

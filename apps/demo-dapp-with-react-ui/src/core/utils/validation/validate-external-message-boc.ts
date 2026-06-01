import { Cell, loadMessage } from '@ton/core';

/**
 * Validates an external-in message BOC pasted into the Find Transaction form.
 * Returns an error message or `null` when valid.
 */
export function validateExternalMessageBoc(value: string): string | null {
    const trimmed = value.trim();

    if (!trimmed) {
        return 'BOC is required';
    }

    try {
        const message = loadMessage(Cell.fromBase64(trimmed).beginParse());
        if (message.info.type !== 'external-in') {
            return `BOC must contain an external-in message (got "${message.info.type}")`;
        }
    } catch {
        return 'BOC must be valid base64-encoded BoC';
    }

    return null;
}

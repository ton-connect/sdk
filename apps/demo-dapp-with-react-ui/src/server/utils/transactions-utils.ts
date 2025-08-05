import { beginCell, storeMessage } from "@ton/core";
/**
 * Generates a normalized hash of an "external-in" message for comparison.
 * Follows TEP-467.
 */
export function getNormalizedExtMessageHash(message: any) {
    if (message.info.type !== 'external-in') {
        throw new Error(`Message must be "external-in", got ${message.info.type}`);
    }
    const info = { ...message.info, src: undefined, importFee: 0n };
    const normalizedMessage = {
        ...message,
        init: null,
        info: info,
    };
    return beginCell().store(storeMessage(normalizedMessage, { forceRef: true })).endCell().hash();
}

/**
 * Retries async fn with delay and count.
 */
export async function retry<T>(fn: () => Promise<T>, options: { retries: number; delay: number }): Promise<T> {
    let lastError: Error | undefined;
    for (let i = 0; i < options.retries; i++) {
        try {
            return await fn();
        } catch (e) {
            if (e instanceof Error) {
                lastError = e;
            }
            await new Promise((resolve) => setTimeout(resolve, options.delay));
        }
    }
    throw lastError;
}
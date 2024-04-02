import { defer } from 'src/utils/defer';

/**
 * Configuration options for the delay function.
 */
export type DelayOptions = {
    /**
     * An 'AbortSignal' object that can be used to abort the delay.
     */
    signal?: AbortSignal;
};

/**
 * Delays the execution of code for a specified number of milliseconds.
 * @param {number} timeout - The number of milliseconds to delay the execution.
 * @param {DelayOptions} [options] - Optional configuration options for the delay.
 * @return {Promise<void>} - A promise that resolves after the specified delay, or rejects if the delay is aborted.
 */
export async function delay(timeout: number, options?: DelayOptions): Promise<void> {
    return await defer(
        async (resolve, reject, options): Promise<void> => {
            const timeoutId = setTimeout(() => resolve(), timeout);
            options.signal?.addEventListener('abort', () => {
                clearTimeout(timeoutId);
                reject(new Error('Aborted'));
            });
        },
        { signal: options?.signal }
    );
}

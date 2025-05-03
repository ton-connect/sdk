import { TonConnectError } from 'src/errors';
import { createAbortController } from 'src/utils/create-abort-controller';

/**
 * Represents the options for deferring a task.
 */
export type DeferOptions = {
    /**
     * The timeout in milliseconds after which the task should be aborted.
     */
    timeout?: number;

    /**
     * An optional AbortSignal to use for aborting the task.
     */
    signal?: AbortSignal;
};

/**
 * Represents a deferrable action that can be executed asynchronously.
 *
 * @template T The type of the value returned by the deferrable action.
 * @param {DeferOptions} [options] The options to configure the deferrable action.
 * @returns {Promise<T>} A promise that resolves with the result of the deferrable action.
 */
export type Deferrable<T> = (
    resolve: (value: T) => void,
    reject: (reason?: any) => void,
    options: DeferOptions
) => Promise<void>;

/**
 * Executes a function and provides deferred behavior, allowing for a timeout and abort functionality.
 *
 * @param {Deferrable<T>} fn - The function to execute. It should return a promise that resolves with the desired result.
 * @param {DeferOptions} options - Optional configuration options for the defer behavior.
 * @returns {Promise<T>} - A promise that resolves with the result of the executed function, or rejects with an error if it times out or is aborted.
 */
export function timeout<T>(fn: Deferrable<T>, options?: DeferOptions): Promise<T> {
    const timeout = options?.timeout;
    const signal = options?.signal;

    const abortController = createAbortController(signal);

    return new Promise(async (resolve, reject) => {
        if (abortController.signal.aborted) {
            reject(new TonConnectError('Operation aborted'));
            return;
        }

        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        if (typeof timeout !== 'undefined') {
            timeoutId = setTimeout(() => {
                abortController.abort();
                reject(new TonConnectError(`Timeout after ${timeout}ms`));
            }, timeout);
        }

        abortController.signal.addEventListener(
            'abort',
            () => {
                clearTimeout(timeoutId);
                reject(new TonConnectError('Operation aborted'));
            },
            { once: true }
        );

        const deferOptions = { timeout, abort: abortController.signal };
        await fn(
            (...args) => {
                clearTimeout(timeoutId);
                resolve(...args);
            },
            () => {
                clearTimeout(timeoutId);
                reject();
            },
            deferOptions
        );
    });
}

import { delay } from 'src/utils/delay';
import { logError } from 'src/utils/log';
import { createAbortController } from 'src/utils/defer';

/**
 * Configuration options for the callForSuccess function.
 */
export type CallForSuccessOptions = {
    /**
     * An 'AbortSignal' object that can be used to abort the function.
     */
    signal?: AbortSignal;

    /**
     * The number of attempts to make before giving up. Default is 20.
     */
    attempts?: number;

    /**
     * The delay in milliseconds between each attempt. Default is 100ms.
     */
    delayMs?: number;
};

/**
 * Function to call ton api until we get response.
 * Because ton network is pretty unstable we need to make sure response is final.
 * @param {T} fn - function to call
 * @param {CallForSuccessOptions} [options] - optional configuration options
 */
export async function callForSuccess<T extends (options: { signal?: AbortSignal }) => Promise<any>>(
    fn: T,
    options?: CallForSuccessOptions
): Promise<Awaited<ReturnType<T>>> {
    const attempts = options?.attempts ?? 10;
    const delayMs = options?.delayMs ?? 200;
    const abortController = createAbortController(options?.signal);

    if (typeof fn !== 'function') {
        throw new Error(`Expected a function, got ${typeof fn}`);
    }

    let i = 0;
    let lastError: unknown;

    while (i < attempts) {
        if (abortController.signal.aborted) {
            logError('Aborted after attempts', i);
            throw new Error(`Aborted after attempts ${i}`);
        }

        try {
            return await fn({ signal: abortController.signal });
        } catch (err) {
            lastError = err;
            i++;
            await delay(delayMs);
        }
    }

    logError('Error after attempts', i);
    throw lastError;
}

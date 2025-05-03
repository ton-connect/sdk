/**
 * Creates an AbortController instance with an optional AbortSignal.
 *
 * @param {AbortSignal} [signal] - An optional AbortSignal to use for aborting the controller.
 * @returns {AbortController} - An instance of AbortController.
 */
export function createAbortController(signal?: AbortSignal): AbortController {
    const abortController = new AbortController();
    if (signal?.aborted) {
        abortController.abort();
    } else {
        signal?.addEventListener('abort', () => abortController.abort(), { once: true });
    }
    return abortController;
}

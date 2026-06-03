import { TonConnectError } from '@tonconnect/sdk';

/**
 * UI-layer precondition failure thrown by `TonConnectUI` — e.g. calling
 * `sendTransaction()` while no wallet is connected, or when the configured
 * `buttonRootId` element is not present in the document.
 *
 * Extends `TonConnectError` so a single `catch (e instanceof TonConnectError)`
 * branch covers both SDK-level and UI-level failures:
 *
 * ```ts
 * try {
 *     await tonConnectUI.signMessage(req);
 * } catch (e) {
 *     if (e instanceof TonConnectUIError) {
 *         // UI precondition (no wallet connected, etc.)
 *     }
 * }
 * ```
 */
export class TonConnectUIError extends TonConnectError {
    constructor(...args: ConstructorParameters<typeof Error>) {
        super(...args);

        Object.setPrototypeOf(this, TonConnectUIError.prototype);
    }
}

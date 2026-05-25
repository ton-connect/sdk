import { TonConnectError } from '@tonconnect/sdk';

/**
 * Base error class for errors thrown by `@tonconnect/ui` itself (modal lifecycle,
 * UI configuration, deeplink helpers, etc.), as opposed to protocol errors
 * surfaced from the SDK. Use `err instanceof TonConnectUIError` to distinguish
 * UI-layer failures from {@link TonConnectError} subclasses raised by
 * `@tonconnect/sdk`. Extends {@link TonConnectError}.
 */
export class TonConnectUIError extends TonConnectError {
    /**
     * Construct a `TonConnectUIError`. Subclasses pass these arguments through
     * via `super(...args)`; consumers normally interact with instances thrown
     * by the package rather than constructing `TonConnectUIError` directly.
     * @param message human-readable message. The resulting `error.message`
     *   is prefixed with `[TON_CONNECT_SDK_ERROR]` and the subclass name
     *   (inherited from {@link TonConnectError}).
     * @param options standard ES `Error` options.
     */
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);

        Object.setPrototypeOf(this, TonConnectUIError.prototype);
    }
}

import { TonConnectUIError } from '@tonconnect/ui';

/**
 * Base class for TonConnectUIReact errors. You can check if the error was triggered by the @tonconnect/ui-react using `err instanceof TonConnectUIReactError`.
 */
export class TonConnectUIReactError extends TonConnectUIError {
    /**
     * Construct a `TonConnectUIReactError`. Subclasses forward arguments
     * through `super(...args)`; consumers normally observe subclass
     * instances rather than constructing `TonConnectUIReactError` directly.
     * @param message human-readable message. The resulting `error.message`
     *   is prefixed with `[TON_CONNECT_SDK_ERROR]` and the subclass name
     *   (inherited from {@link TonConnectError}).
     * @param options standard ES `Error` options.
     */
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);

        Object.setPrototypeOf(this, TonConnectUIReactError.prototype);
    }
}

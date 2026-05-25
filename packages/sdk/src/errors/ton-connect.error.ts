/**
 * Base class for TonConnect errors. You can check if the error was triggered by the @tonconnect/sdk using `err instanceof TonConnectError`.
 */
export class TonConnectError<T = unknown> extends Error {
    private static prefix = '[TON_CONNECT_SDK_ERROR]';

    protected get info(): string {
        return '';
    }

    /**
     * Construct a TonConnect error. Subclasses pass these arguments through
     * via `super(...args)`; consumers normally interact with subclass
     * instances rather than constructing `TonConnectError` directly.
     * @param message human-readable message. The resulting `error.message`
     *   is prefixed with `[TON_CONNECT_SDK_ERROR]` and the subclass name.
     * @param options standard ES `Error` options. `cause` is typed by the
     *   subclass: `WalletWrongNetworkError` uses
     *   `{ expectedChainId, actualChainId }`, `WalletNotSupportFeatureError`
     *   uses `{ requiredFeature }`, and so on.
     */
    constructor(
        message?: string,
        options?: {
            cause?: T;
        }
    ) {
        super(message, options);

        this.message = `${TonConnectError.prefix} ${this.constructor.name}${
            this.info ? ': ' + this.info : ''
        }${message ? '\n' + message : ''}`;

        Object.setPrototypeOf(this, TonConnectError.prototype);
    }
}

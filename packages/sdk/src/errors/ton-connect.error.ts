/**
 * Base class for every error thrown by `@tonconnect/sdk`. Catch it to handle
 * TON Connect failures uniformly.
 *
 * @example
 * ```ts
 * try {
 *     await connector.sendTransaction(tx);
 * } catch (e) {
 *     if (e instanceof TonConnectError) {
 *         // wallet error, validation error, user rejection — all subclass this.
 *     }
 * }
 * ```
 */
export class TonConnectError<T = unknown> extends Error {
    private static prefix = '[TON_CONNECT_SDK_ERROR]';

    protected get info(): string {
        return '';
    }

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

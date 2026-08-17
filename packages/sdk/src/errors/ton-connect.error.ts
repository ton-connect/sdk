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

    private readonly rawMessage?: string;

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

        this.rawMessage = message;
        this.setName('TonConnectError');

        Object.setPrototypeOf(this, TonConnectError.prototype);
    }

    /**
     * Set the error's `name` to a stable, minification-safe value and rebuild the
     * displayed `message` from it.
     *
     * The `name` must be passed as a string literal rather than derived from
     * `this.constructor.name`: bundlers rename classes in production builds, so
     * `this.constructor.name` collapses to a single letter and the logged message
     * becomes e.g. `[TON_CONNECT_SDK_ERROR] A` instead of the real class name.
     * Every subclass calls this with its own name right after `super(...)`.
     */
    protected setName(name: string): void {
        this.name = name;
        this.message = `${TonConnectError.prefix} ${name}${
            this.info ? ': ' + this.info : ''
        }${this.rawMessage ? '\n' + this.rawMessage : ''}`;
    }
}

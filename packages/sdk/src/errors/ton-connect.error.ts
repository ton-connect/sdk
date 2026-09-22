/**
 * The error a wallet returned, as it arrived. Present only on errors built
 * from a wallet response.
 */
export interface WalletErrorDetail {
    /** Wallet error code from the TON Connect spec. */
    code: number;
    /** Wallet error message; empty when the wallet sent none. */
    message: string;
    /** Wallet-provided `data`, when present. */
    data?: unknown;
    /** `id` of the wallet response, when present. */
    responseId?: string;
    /**
     * Set when the wallet rejected the request instead of answering with an
     * error response, and the SDK rebuilt the response from the rejection.
     */
    normalized?: true;
}

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

    /**
     * Class name as a string literal, so it survives the class renaming a dApp's
     * minifier applies. Every SDK error class declares its own; it becomes the
     * error's `name` and the name in its `message`.
     */
    static readonly errorName: string = 'TonConnectError';

    /**
     * The wallet's own error, when this error was built from a wallet
     * response. Absent for errors raised by the SDK itself.
     */
    declare readonly walletError?: WalletErrorDetail;

    protected get info(): string {
        return '';
    }

    constructor(
        message?: string,
        options?: {
            cause?: T;
            walletError?: WalletErrorDetail;
        }
    ) {
        super(message, options);

        Object.setPrototypeOf(this, new.target.prototype);

        const name = errorNameOf(new.target);
        Object.defineProperty(this, 'name', {
            value: name,
            writable: true,
            configurable: true,
            enumerable: false
        });

        if (options?.walletError) {
            Object.defineProperty(this, 'walletError', {
                value: options.walletError,
                writable: false,
                configurable: true,
                enumerable: false
            });
        }

        this.message = `${TonConnectError.prefix} ${name}${
            this.info ? ': ' + this.info : ''
        }${message ? '\n' + message : ''}`;
    }
}

/**
 * A subclass declared outside the SDK without its own `errorName` keeps its
 * runtime class name instead of inheriting its parent's.
 */
function errorNameOf(ErrorClass: typeof TonConnectError): string {
    return Object.prototype.hasOwnProperty.call(ErrorClass, 'errorName')
        ? ErrorClass.errorName
        : ErrorClass.name;
}

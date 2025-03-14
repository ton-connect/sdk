/**
 * Base class for TonConnect errors. You can check if the error was triggered by the @tonconnect/sdk using `err instanceof TonConnectError`.
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

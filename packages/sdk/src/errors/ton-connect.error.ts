/**
 * Base class for TonConnect errors. You can check if the error was triggered by the @tonconnect/sdk using `err instanceof TonConnectError`.
 */
export class TonConnectError extends Error {
    private static prefix = '[TON_CONNECT_SDK_ERROR]';

    protected info?: string;

    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);

        this.message = `${TonConnectError.prefix} ${this.constructor.name}${
            this.info ? ':' + this.info : ''
        }\n
            ${message}
        `;
        Object.setPrototypeOf(this, TonConnectError.prototype);
    }
}

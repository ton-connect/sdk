/**
 * Base class for TonConnect errors. You can check if the error was triggered by the @tonconnect/sdk using `err instanceof TonConnectError`.
 */
export class TonConnectError extends Error {
    private static prefix = '[TON_CONNECT_SDK_ERROR]';

    constructor(message?: string, options?: ErrorOptions) {
        if (message) {
            message = TonConnectError.prefix + ' ' + message;
        }
        super(message, options);

        Object.setPrototypeOf(this, TonConnectError.prototype);
    }
}

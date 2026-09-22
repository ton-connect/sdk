import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when the wallet does not support the requested method.
 */
export class MethodNotSupportedError extends TonConnectError {
    static readonly errorName: string = 'MethodNotSupportedError';

    protected get info(): string {
        return 'Wallet does not support the requested method.';
    }
}

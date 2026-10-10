import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when request to the wallet contains errors.
 */
export class BadRequestError extends TonConnectError {
    static readonly errorName: string = 'BadRequestError';

    protected get info(): string {
        return 'Request to the wallet contains errors.';
    }
}

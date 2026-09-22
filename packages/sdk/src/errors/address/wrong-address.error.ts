import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when passed address is in incorrect format.
 */
export class WrongAddressError extends TonConnectError {
    static readonly errorName: string = 'WrongAddressError';

    protected get info(): string {
        return 'Passed address is in incorrect format.';
    }
}

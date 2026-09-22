import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when passed hex is in incorrect format.
 */
export class ParseHexError extends TonConnectError {
    static readonly errorName: string = 'ParseHexError';

    protected get info(): string {
        return 'Passed hex is in incorrect format.';
    }
}

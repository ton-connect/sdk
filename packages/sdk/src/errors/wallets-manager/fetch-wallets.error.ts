import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when an error occurred while fetching the wallets list.
 */
export class FetchWalletsError extends TonConnectError {
    static readonly errorName: string = 'FetchWalletsError';

    protected get info(): string {
        return 'An error occurred while fetching the wallets list.';
    }
}

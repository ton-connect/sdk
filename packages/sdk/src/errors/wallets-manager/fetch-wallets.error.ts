import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when an error occurred while fetching the wallets list.
 */
export class FetchWalletsError extends TonConnectError {
    info = 'An error occurred while fetching the wallets list.';

    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, FetchWalletsError.prototype);
    }
}

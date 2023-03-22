import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when wallet connection called but wallet already connected. To avoid the error, disconnect the wallet before doing a new connection.
 */
export class WalletAlreadyConnectedError extends TonConnectError {
    protected get info(): string {
        return 'Wallet connection called but wallet already connected. To avoid the error, disconnect the wallet before doing a new connection.';
    }

    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, WalletAlreadyConnectedError.prototype);
    }
}

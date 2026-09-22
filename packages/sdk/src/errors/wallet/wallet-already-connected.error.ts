import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when wallet connection called but wallet already connected.
 */
export class WalletAlreadyConnectedError extends TonConnectError {
    static readonly errorName: string = 'WalletAlreadyConnectedError';

    protected get info(): string {
        return 'Wallet connection called but wallet already connected. To avoid the error, disconnect the wallet before doing a new connection.';
    }
}

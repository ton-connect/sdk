import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when send transaction or other protocol methods called while wallet is not connected.
 */
export class WalletNotConnectedError extends TonConnectError {
    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, WalletNotConnectedError.prototype);
    }
}

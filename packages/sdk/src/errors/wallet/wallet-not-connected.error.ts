import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when send transaction or other methods called while wallet is not connected.
 */
export class WalletNotConnectedError extends TonConnectError {
    protected get info(): string {
        return 'Send transaction or other protocol methods called while wallet is not connected.';
    }

    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        this.setName('WalletNotConnectedError');

        Object.setPrototypeOf(this, WalletNotConnectedError.prototype);
    }
}

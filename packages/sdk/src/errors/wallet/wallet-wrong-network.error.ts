import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when the wallet's `account.chain` does not match the network the dApp
 * expects — either the chain configured via `setConnectionNetwork` (on
 * `connect`) or the network on a transaction or sign request. `cause` carries
 * the expected and actual chain IDs for inspection.
 */
export class WalletWrongNetworkError extends TonConnectError<{
    expectedChainId: string;
    actualChainId: string;
}> {
    constructor(
        message: string,
        options: {
            cause: { expectedChainId: string; actualChainId: string };
        }
    ) {
        super(message, options);
        this.name = 'WalletWrongNetworkError';
        Object.setPrototypeOf(this, WalletWrongNetworkError.prototype);
    }
}

import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when the wallet is connected to a network that does not match the one
 * the dApp requested via `ITonConnect.setConnectionNetwork` or the `network`
 * field of `sendTransaction` / `signData` / `signMessage`.
 *
 * @see [`network` field (RPC spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md#sendtransaction)
 */
export class WalletWrongNetworkError extends TonConnectError<{
    expectedChainId: string;
    actualChainId: string;
}> {
    declare cause: {
        /** Chain id the dApp asked for. */
        expectedChainId: string;
        /** Chain id the wallet returned / is connected to. */
        actualChainId: string;
    };

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

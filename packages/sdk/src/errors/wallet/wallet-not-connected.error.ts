import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when send transaction or other methods called while wallet is not connected.
 */
export class WalletNotConnectedError extends TonConnectError {
    static readonly errorName: string = 'WalletNotConnectedError';

    protected get info(): string {
        return 'Send transaction or other protocol methods called while wallet is not connected.';
    }
}

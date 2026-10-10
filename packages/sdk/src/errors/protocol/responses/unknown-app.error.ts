import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when the wallet returns `UNKNOWN_APP` (code 100): the session or app is unknown to the wallet.
 */
export class UnknownAppError extends TonConnectError {
    static readonly errorName: string = 'UnknownAppError';

    protected get info(): string {
        return 'App tries to send rpc request to the injected wallet while not connected.';
    }
}

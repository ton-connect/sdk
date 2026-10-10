import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when a request to the wallet failed without the wallet returning a
 * TON Connect response: the wallet's bridge threw, rejected with something
 * that is not a TON Connect error, or the SDK could not prepare the request.
 * `cause` holds the original value.
 */
export class WalletTransportError extends TonConnectError {
    static readonly errorName: string = 'WalletTransportError';

    protected get info(): string {
        return 'Request to the wallet failed without a TON Connect response.';
    }
}

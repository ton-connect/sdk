import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when no `storage` was specified in `TonConnectOptions` and a default
 * `localStorage` was not detected in the Node.js environment.
 */
export class LocalstorageNotFoundError extends TonConnectError {
    static readonly errorName: string = 'LocalstorageNotFoundError';

    protected get info(): string {
        return 'Storage was not specified in the `DappMetadata` and default `localStorage` was not detected in the environment.';
    }
}

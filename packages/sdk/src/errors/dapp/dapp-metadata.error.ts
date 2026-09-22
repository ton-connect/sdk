import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when passed DappMetadata is in incorrect format.
 */
export class DappMetadataError extends TonConnectError {
    static readonly errorName: string = 'DappMetadataError';

    protected get info(): string {
        return 'Passed DappMetadata is in incorrect format.';
    }
}

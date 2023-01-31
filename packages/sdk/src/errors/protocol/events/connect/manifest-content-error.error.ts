import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when passed manifest contains errors.
 */
export class ManifestContentErrorError extends TonConnectError {
    protected get info(): string {
        return 'Passed `tonconnect-manifest.json` contains errors. Check format of your manifest. See more https://github.com/ton-connect/docs/blob/main/requests-responses.md#app-manifest';
    }

    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, ManifestContentErrorError.prototype);
    }
}

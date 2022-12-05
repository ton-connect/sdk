import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when passed manifest contains errors.
 */
export class ManifestContentErrorError extends TonConnectError {
    private static additionalMessage =
        '\nPassed `tonconnect-manifest.json` contains errors. Check format of your manifest. See more https://github.com/ton-connect/docs/blob/main/requests-responses.md#app-manifest';

    constructor(message?: string) {
        super(message || '' + ManifestContentErrorError.additionalMessage);

        Object.setPrototypeOf(this, ManifestContentErrorError.prototype);
    }
}

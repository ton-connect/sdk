import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when wallet can't get manifest by passed manifestUrl.
 */
export class ManifestNotFoundError extends TonConnectError {
    private static additionalMessage =
        '\nManifest not found. Make sure you added `tonconnect-manifest.json` to the root of your app or passed correct manifestUrl. See more https://github.com/ton-connect/docs/blob/main/requests-responses.md#app-manifest';

    constructor(message?: string) {
        super(message || '' + ManifestNotFoundError.additionalMessage);

        Object.setPrototypeOf(this, ManifestNotFoundError.prototype);
    }
}

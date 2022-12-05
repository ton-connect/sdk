import { IStorage } from 'src/storage/models/storage.interface';

/**
 * TonConnect constructor options
 */
export interface TonConnectOptions {
    /**
     * Url to the [manifest]{@link https://github.com/ton-connect/docs/blob/main/requests-responses.md#app-manifest} with the Dapp metadata that will be displayed in the user's wallet.
     * If not passed, manifest from `${window.location.origin}/tonconnect-manifest.json` will be taken.
     */
    manifestUrl?: string;

    /**
     * Storage to save protocol data. For browser default is `localStorage`. If you use SDK with nodeJS, you have to specify this field.
     */
    storage?: IStorage;
}

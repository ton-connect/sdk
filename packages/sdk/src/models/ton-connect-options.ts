import { Feature } from '@tonconnect/protocol';
import { IStorage } from 'src/storage/models/storage.interface';
import { EventDispatcher } from 'src/tracker/event-dispatcher';
import { SdkActionEvent } from 'src/tracker/types';
import { RequireFeature } from './wallet';

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

    /**
     * Event dispatcher to track user actions. By default, it uses `window.dispatchEvent` for browser environment.
     */
    eventDispatcher?: EventDispatcher<SdkActionEvent>;

    /**
     * Redefine wallets list source URL. Must be a link to a json file with [following structure]{@link https://github.com/ton-connect/wallets-list}
     * @default https://raw.githubusercontent.com/ton-connect/wallets-list/main/wallets.json
     * @
     */
    walletsListSource?: string;

    /**
     * Wallets list cache time to live
     * @default Infinity
     */
    walletsListCacheTTLMs?: number;

    /**
     * Required features for wallets. If wallet doesn't support required features, it will be disabled.
     */
    walletsRequiredFeatures?: RequireFeature[] | ((features: Feature[]) => boolean);

    /**
     * Allows to disable auto pause/unpause SSE connection on 'document.visibilitychange' event. It is not recommended to change default behaviour.
     */
    disableAutoPauseConnection?: boolean;
}

import { IStorage } from 'src/storage/models/storage.interface';
import { EventDispatcher } from 'src/tracker/event-dispatcher';
import { SdkActionEvent } from 'src/tracker/types';
import { RequiredFeatures } from './wallet';
import { IEnvironment } from 'src/environment/models/environment.interface';
import { AnalyticsMode } from 'src/analytics/analytics-manager';

export interface AnalyticsSettings {
    /**
     * @default 'telemetry'
     */
    mode?: AnalyticsMode;
}

/**
 * TonConnect constructor options
 */
export interface TonConnectOptions {
    /**
     * Url to the [manifest]{@link https://github.com/ton-connect/docs/blob/main/requests-responses.md#app-manifest} with the Dapp metadata that will be displayed in the user's wallet.
     * If not passed, manifest from `${window.location.origin}/tonconnect-manifest.json` will be taken.
     */
    manifestUrl?: string;

    manifest?: {
        url: string; // required
        name: string; // required
        iconUrl: string; // required
        termsOfUseUrl?: string; // optional
        privacyPolicyUrl?: string; // optional
    };

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
     * @default https://config.ton.org/wallets-v2.json
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
    walletsRequiredFeatures?: RequiredFeatures;

    /**
     * Allows to disable auto pause/unpause SSE connection on 'document.visibilitychange' event. It is not recommended to change default behaviour.
     */
    disableAutoPauseConnection?: boolean;

    /**
     * Represents the client environment in which the application is running.
     */
    environment?: IEnvironment;

    /**
     * Analytics configuration.
     */
    analytics?: AnalyticsSettings;
}

import { ConnectAdditionalRequest } from '../connect';

/**
 * Options when sending an operation via intent.
 */
export interface IntentUrlOptions {
    /**
     * Additional connect request to perform before/with intent.
     */
    connectRequest?: ConnectAdditionalRequest;
    excludeConnect?: boolean;
    signal?: AbortSignal;
    onIntentUrlReady?: (url: string) => void;
}

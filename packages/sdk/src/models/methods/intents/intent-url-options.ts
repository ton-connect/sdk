import { ConnectAdditionalRequest } from '../connect';

/**
 * Options when building an intent deep link URL.
 */
export interface IntentUrlOptions {
    connectRequest?: ConnectAdditionalRequest;
    excludeConnect?: boolean;
}

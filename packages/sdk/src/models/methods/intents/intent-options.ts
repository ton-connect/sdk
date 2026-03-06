import { ConnectAdditionalRequest } from '../connect';

/**
 * Options when sending an operation via intent.
 */
export interface IntentOptions {
    connectRequest?: ConnectAdditionalRequest;
    signal?: AbortSignal;
}

import { ConnectAdditionalRequest } from '../connect';

/**
 * Options when sending an operation via intent.
 */
export interface IntentUrlOptions {
    connectRequest?: ConnectAdditionalRequest;
    objectStorageUrl?: string;
    ttl?: number;
    signal?: AbortSignal;
}

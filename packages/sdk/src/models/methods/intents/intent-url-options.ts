import { ConnectAdditionalRequest } from '../connect';

export type ConnectRequestForIntent = import('@tonconnect/protocol').ConnectRequest;

/**
 * Options when sending an operation via intent.
 */
export interface IntentUrlOptions {
    connectRequest?: ConnectAdditionalRequest | ConnectRequestForIntent;
    excludeConnect?: boolean;
    objectStorageUrl?: string;
    ttl?: number;
    signal?: AbortSignal;
    onIntentUrlReady?: (url: string) => void;
}

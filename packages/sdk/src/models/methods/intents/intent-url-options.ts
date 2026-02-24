import { ConnectRequest } from '@tonconnect/protocol';

/**
 * Options when building an intent deep link URL.
 */
export interface IntentUrlOptions {
    /** Optional connect request to establish/reuse connection after the intent (spec field `c`). */
    connectRequest?: ConnectRequest;
    /** Use object storage for payload instead of URL-embedded (Approach 1 vs 2). */
    useObjectStorage?: boolean;
    /** Object storage base URL when useObjectStorage is true. */
    objectStorageUrl?: string;
    /** TTL in seconds for object storage. */
    ttl?: number;
}

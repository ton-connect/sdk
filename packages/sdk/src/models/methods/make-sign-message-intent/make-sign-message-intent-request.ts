import { ChainId, ConnectRequest, IntentItem } from '@tonconnect/protocol';

export interface MakeSignMessageIntentRequest {
    /**
     * Request ID
     */
    id: string;

    /**
     * Optional connect request for first-time connection
     */
    c?: ConnectRequest;

    /**
     * Valid until - unix timestamp. After this moment the intent is invalid.
     */
    vu?: number;

    /**
     * Target network; semantics match signMessage
     */
    n?: ChainId;

    /**
     * Ordered list of intent fragments. Same structure as in Send Transaction Intent.
     */
    i: IntentItem[];
}

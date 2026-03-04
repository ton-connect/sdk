import { ChainId, ConnectRequest, IntentItem } from '@tonconnect/protocol';

export interface MakeSendTransactionIntentRequest {
    /**
     * Request ID
     */
    id: string;

    /**
     * Optional connect request for first-time connection
     */
    c?: ConnectRequest;

    /**
     * Unix timestamp. After this moment the intent is invalid.
     */
    vu?: number;

    /**
     * Target network; semantics match sendTransaction.
     */
    n?: ChainId;

    /**
     * Ordered list of intent fragments.
     */
    i: IntentItem[];
}

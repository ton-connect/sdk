import { ChainId, ConnectRequest, SignDataPayload } from '@tonconnect/protocol';

export interface MakeSignDataIntentRequest {
    /**
     * Request ID
     */
    id: string;

    /**
     * Optional connect request for first-time connection
     */
    c?: ConnectRequest;

    /**
     * Target network; semantics match signData
     */
    n?: ChainId;

    /**
     * TonConnect manifest URL used for domain binding.
     * If not provided, will be extracted from c.manifestUrl if ConnectRequest is present.
     */
    mu?: string;

    /**
     * Sign data payload (Text, Binary, or Cell).
     * Note that `network` and `from` fields from the payload types are ignored in intents,
     * as they are specified at the intent level.
     */
    p: SignDataPayload;
}

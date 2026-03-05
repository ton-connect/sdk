import { ChainId, SignDataPayload } from '@tonconnect/protocol';

export interface SignDataIntentRequest {
    network?: ChainId;
    /**
     * Explicit sender address for the intent.
     * If omitted, the wallet will use its default selected account.
     */
    from?: string;
    payload: SignDataPayload;
}

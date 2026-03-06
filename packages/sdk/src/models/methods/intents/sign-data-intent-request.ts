import { ChainId, SignDataPayload } from '@tonconnect/protocol';

export interface SignDataIntentRequest {
    network?: ChainId;
    /**
     * The sender address in '<wc>:<hex>' format from which DApp intends to send the transaction. Current account.address by default.
     */
    from?: string;
    payload: SignDataPayload;
}

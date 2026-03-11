import { ChainId, SignDataPayload } from '@tonconnect/protocol';

export interface SignDataDraftRequest {
    network?: ChainId;
    /**
     * The sender address in '<wc>:<hex>' format. Current account.address by default.
     */
    from?: string;
    payload: SignDataPayload;
}

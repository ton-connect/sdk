import { ChainId, SignDataPayload } from '@tonconnect/protocol';

export interface SignDataIntentRequest {
    network?: ChainId;
    payload: SignDataPayload;
}

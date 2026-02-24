import { ChainId, SignDataPayload } from '@tonconnect/protocol';

export interface SignDataIntentRequest {
    network?: ChainId;
    manifestUrl: string;
    payload: SignDataPayload;
}

import { SignDataPayload } from '@tonconnect/protocol';

export type SignDataResponse = {
    signature: string;
    address: string;
    timestamp: number;
    domain: string;
    payload: SignDataPayload;
};

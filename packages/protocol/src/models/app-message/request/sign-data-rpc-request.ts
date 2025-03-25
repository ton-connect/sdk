import { SignDataPayload } from '../../sign-data-payload';

export interface SignDataRpcRequest {
    id: string;
    params: SignDataPayload;
    method: 'signData';
}

import type { ConnectRequest } from '../connect-request';

/**
 * SignData draft payload in standard RPC format.
 * Uses the same format as signData RPC request, with an optional embedded connect request.
 */
export interface RawSignDataDraftPayload {
    id: string;
    method: 'signData';
    params: string[];
    /**
     * Optional connect request to be executed before handling the draft.
     */
    c?: ConnectRequest;
}

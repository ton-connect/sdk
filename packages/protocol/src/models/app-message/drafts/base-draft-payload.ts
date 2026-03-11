import { ConnectRequest } from '../connect-request';

/**
 * Common fields for all raw draft payloads.
 *
 * Field names are shortened to keep the URL compact:
 * - `id`: draft identifier, used to match responses.
 * - `m`: draft message type discriminator.
 * - `c`: optional embedded connect request to be executed together with the draft.
 */
export interface RawBaseDraftPayload {
    /**
     * Draft identifier. Must be unique per dApp session and is echoed back in the wallet response.
     */
    id: string;

    /**
     * Draft message type discriminator:
     * - `txDraft` – send transaction draft;
     * - `signMsgDraft` – sign message draft;
     * - `actionDraft` – generic action draft.
     */
    m: 'txDraft' | 'signMsgDraft' | 'actionDraft';

    /**
     * Optional connect request to be executed before handling the draft.
     * Allows wallets to establish a session as part of the draft flow.
     */
    c?: ConnectRequest;
}

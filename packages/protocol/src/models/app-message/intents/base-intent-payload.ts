import { ConnectRequest } from '../connect-request';

/**
 * Common fields for all raw intent payloads.
 *
 * Field names are shortened to keep the URL compact:
 * - `id`: intent identifier, used to match responses.
 * - `m`: intent message type discriminator.
 * - `c`: optional embedded connect request to be executed together with the intent.
 */
export interface RawBaseIntentPayload {
    /**
     * Intent identifier. Must be unique per dApp session and is echoed back in the wallet response.
     */
    id: string;

    /**
     * Intent message type discriminator:
     * - `txIntent` – send transaction intent;
     * - `signIntent` – sign data intent;
     * - `signMsg` – sign message intent;
     * - `actionIntent` – generic action intent.
     */
    m: 'txIntent' | 'signIntent' | 'signMsg' | 'actionIntent';

    /**
     * Optional connect request to be executed before handling the intent.
     * Allows wallets to establish a session as part of the intent flow.
     */
    c?: ConnectRequest;
}

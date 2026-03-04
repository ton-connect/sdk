import { RawBaseIntentPayload } from './base-intent-payload';
import type { SignDataPayload } from '../../wallet-message';
import type { ChainId } from '../../CHAIN';

export interface RawSignDataIntentRequest extends RawBaseIntentPayload {
    /**
     * Must be set to `signIntent`.
     */
    m: 'signIntent';

    /**
     * Target network identifier.
     */
    n?: ChainId;

    /**
     * URL of the dApp `tonconnect-manifest.json` used for domain binding.
     */
    mu: string;

    /**
     * Payload to sign (text / binary / cell).
     */
    p: SignDataPayload;
}

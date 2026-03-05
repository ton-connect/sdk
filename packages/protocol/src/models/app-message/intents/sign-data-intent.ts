import { RawBaseIntentPayload } from './base-intent-payload';
import type { SignDataPayload } from '../../wallet-message';
import type { ChainId } from '../../CHAIN';

export interface RawSignDataIntentRequest extends RawBaseIntentPayload {
    /**
     * Must be set to `signIntent`.
     */
    m: 'signIntent';

    /**
     * The sender address in '<wc>:<hex>' format from which DApp intends to send the transaction. Current account.address by default.
     */
    f?: string;

    /**
     * Target network identifier.
     */
    n?: ChainId;

    /**
     * URL of the dApp `tonconnect-manifest.json` used for domain binding.
     * Optional. Must be set only if 'c' (connect_request) is not presented.
     */
    mu?: string;

    /**
     * Payload to sign (text / binary / cell).
     */
    p: SignDataPayload;
}

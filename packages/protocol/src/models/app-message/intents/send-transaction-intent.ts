import { RawBaseIntentPayload } from './base-intent-payload';
import type { IntentItem } from './intent-items';
import type { ChainId } from '../../CHAIN';

export interface RawSendTransactionIntentRequest extends RawBaseIntentPayload {
    /**
     * Must be set to `txIntent`.
     */
    m: 'txIntent';

    /**
     * Intent processing deadline in unix epoch seconds.
     * After this moment wallets should treat the intent as expired.
     */
    vu?: number;

    /**
     * Explicit sender address for the intent.
     * Shortened field name: `f` (maps to `from` in high-level SDK types).
     */
    f?: string;

    /**
     * Target network identifier.
     */
    n?: ChainId;

    /**
     * List of transfer instructions encoded as compact intent items.
     */
    i: IntentItem[];
}

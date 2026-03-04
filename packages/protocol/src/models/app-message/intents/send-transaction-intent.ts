import { BaseIntentPayload } from './base-intent-payload';
import type { IntentItem } from './intent-items';

export interface SendTransactionIntentRequest extends BaseIntentPayload {
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
     * Target network identifier (e.g. `-239`, `-3`).
     * If omitted, wallet chooses its current network.
     */
    n?: string;

    /**
     * List of transfer instructions encoded as compact intent items.
     */
    i: IntentItem[];
}

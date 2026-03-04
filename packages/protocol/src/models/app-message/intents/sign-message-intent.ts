import { BaseIntentPayload } from './base-intent-payload';
import type { IntentItem } from './intent-items';

export interface SignMessageIntentRequest extends BaseIntentPayload {
    /**
     * Must be set to `signMsg`.
     */
    m: 'signMsg';

    /**
     * Intent processing deadline in unix epoch seconds.
     */
    vu?: number;

    /**
     * Target network identifier (e.g. `-239`, `-3`).
     */
    n?: string;

    /**
     * Messages to build and sign as a single internal message BoC.
     */
    i: IntentItem[];
}

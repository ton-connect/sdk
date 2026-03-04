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
     * Target network identifier.
     */
    n?: ChainId;

    /**
     * List of transfer instructions encoded as compact intent items.
     */
    i: IntentItem[];
}

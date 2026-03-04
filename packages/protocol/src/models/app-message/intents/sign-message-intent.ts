import type { ChainId } from '../../CHAIN';
import { RawBaseIntentPayload } from './base-intent-payload';
import type { IntentItem } from './intent-items';

export interface RawSignMessageIntentRequest extends RawBaseIntentPayload {
    /**
     * Must be set to `signMsg`.
     */
    m: 'signMsg';

    /**
     * Intent processing deadline in unix epoch seconds.
     */
    vu?: number;

    /**
     * Target network identifier.
     */
    n?: ChainId;

    /**
     * Messages to build and sign as a single internal message BoC.
     */
    i: IntentItem[];
}

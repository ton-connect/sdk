import type { ChainId } from '../../CHAIN';
import { RawBaseDraftPayload } from './base-draft-payload';
import type { DraftItem } from './draft-items';

export interface RawSignMessageDraftRequest extends RawBaseDraftPayload {
    /**
     * Must be set to `signMsgDraft`.
     */
    m: 'signMsgDraft';

    /**
     * Draft processing deadline in unix epoch seconds.
     */
    vu?: number;

    /**
     * Target network identifier.
     */
    n?: ChainId;

    /**
     * Messages to build and sign as a single internal message BoC.
     */
    i: DraftItem[];
}

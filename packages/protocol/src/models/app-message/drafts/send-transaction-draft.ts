import { RawBaseDraftPayload } from './base-draft-payload';
import type { DraftItem } from './draft-items';
import type { ChainId } from '../../CHAIN';

export interface RawSendTransactionDraftRequest extends RawBaseDraftPayload {
    /**
     * Must be set to `txDraft`.
     */
    m: 'txDraft';

    /**
     * Draft processing deadline in unix epoch seconds.
     * After this moment wallets should treat the draft as expired.
     */
    vu?: number;

    /**
     * The sender address in '<wc>:<hex>' format from which DApp intends to send the transaction. Current account.address by default.
     */
    f?: string;

    /**
     * Target network identifier.
     */
    n?: ChainId;

    /**
     * List of transfer instructions encoded as compact draft items.
     */
    i: DraftItem[];
}

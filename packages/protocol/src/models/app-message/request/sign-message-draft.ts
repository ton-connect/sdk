import type { ChainId } from '../../CHAIN';
import type { TransactionDraftItem } from './draft-items';

export interface RawSignMessageDraftRequest {
    id: string;
    method: 'signMsgDraft';
    params: {
        /* Unix timestamp. After this moment the draft is invalid. */
        vu?: number;
        /* The sender address in '<wc>:<hex>' format. Semantics match `signMessage` */
        f?: string;
        /* Target network; semantics match `signMessage` */
        n?: ChainId;
        /* Ordered list of items. Each item has a `t` and fields matching `ton` / `jetton` / `nft` */
        i: TransactionDraftItem[];
    };
}

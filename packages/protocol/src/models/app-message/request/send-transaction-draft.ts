import type { ChainId } from '../../CHAIN';
import { TransactionDraftItem } from './draft-items';

export interface RawSendTransactionDraftRequest {
    id: string;
    method: 'txDraft';
    params: {
        /* Unix timestamp. After this moment the draft is invalid.*/
        vu?: number;
        /* The sender address in '<wc>:<hex>' format. Semantics match `sendTransaction` */
        f?: string;
        /* Target network; semantics match `sendTransaction` */
        n?: ChainId;
        /* Ordered list of items. Each item has a `t` and fields matching `ton` / `jetton` / `nft` */
        i: TransactionDraftItem[];
    };
}

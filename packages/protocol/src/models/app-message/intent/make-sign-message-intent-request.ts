import { ConnectRequest } from '../connect-request';
import { IntentItem } from './make-send-transaction-intent-request';

export interface MakeSignMessageIntentRequest {
    id: string;
    m: 'signMsg';
    c?: ConnectRequest; // optional - see Intents section
    vu?: number; // valid_until - unix timestamp. After this moment the intent is invalid.
    n?: string; // target network; semantics match signMessage
    i: IntentItem[]; // items - ordered list of intent fragments. Each item has a `t` and fields matching `ton` / `jetton` / `nft` below, same as in Send Transaction Intent.
}

export type ConnectItem = TonAddressItem | TonProofItem;

import type { ChainId } from '../../CHAIN';

export interface TonAddressItem {
    name: 'ton_addr';
    /**
     * Desired network global_id. If provided, wallet should connect on this network.
     */
    network?: ChainId;
}

export interface TonProofItem {
    name: 'ton_proof';
    payload: string;
}

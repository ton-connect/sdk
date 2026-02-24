import { ChainId } from '@tonconnect/protocol';

export interface SendTransactionIntentItemTon {
    type: 'ton';
    address: string;
    amount: string;
    payload?: string;
    stateInit?: string;
    extraCurrency?: { [k: number]: string };
}

export interface SendTransactionIntentItemJetton {
    type: 'jetton';
    jettonMasterAddress: string;
    amount: string;
    destination: string;
    responseDestination?: string;
    customPayload?: string;
    forwardTonAmount?: string;
    forwardPayload?: string;
    queryId?: number;
}

export interface SendTransactionIntentItemNft {
    type: 'nft';
    nftAddress: string;
    newOwnerAddress: string;
    responseDestination?: string;
    customPayload?: string;
    forwardTonAmount?: string;
    forwardPayload?: string;
    queryId?: number;
}

export type SendTransactionIntentItem =
    | SendTransactionIntentItemTon
    | SendTransactionIntentItemJetton
    | SendTransactionIntentItemNft;

export interface SendTransactionIntentRequest {
    validUntil: number;
    network?: ChainId;
    items: SendTransactionIntentItem[];
}

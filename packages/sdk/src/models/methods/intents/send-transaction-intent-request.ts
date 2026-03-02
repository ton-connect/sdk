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
    jettonAmount: string;
    attachedTon?: string;
    destination: string;
    responseDestination?: string;
    customPayload?: string;
    forwardTonAmount?: string;
    forwardPayload?: string;
    queryId?: number;
}

export interface SendTransactionIntentItemNft {
    type: 'nft';
    attachedTon?: string;
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

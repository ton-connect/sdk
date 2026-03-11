import { ChainId } from '@tonconnect/protocol';

export interface SendTransactionDraftItemTon {
    type: 'ton';
    address: string;
    amount: string;
    payload?: string;
    stateInit?: string;
    extraCurrency?: { [k: number]: string };
}

export interface SendTransactionDraftItemJetton {
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

export interface SendTransactionDraftItemNft {
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

export type SendTransactionDraftItem =
    | SendTransactionDraftItemTon
    | SendTransactionDraftItemJetton
    | SendTransactionDraftItemNft;

export interface SendTransactionDraftRequest {
    validUntil: number;
    network?: ChainId;
    /**
     * The sender address in '<wc>:<hex>' format. Current account.address by default.
     */
    from?: string;
    items: SendTransactionDraftItem[];
}

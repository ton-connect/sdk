import { ConnectRequest } from '../connect-request';

export interface MakeSendTransactionIntentRequest {
    id: string;
    m: 'txIntent';
    c?: ConnectRequest; // optional - see Intents section
    vu?: number; // unix timestamp. After this moment the intent is invalid.
    n?: string; // target network; semantics match sendTransaction.
    i: IntentItem[]; // ordered list of intent fragments
}

export type IntentItem = SendTonItem | SendJettonItem | SendNftItem;

export interface SendTonItem {
    t: 'ton';
    a: string; // message destination in user-friendly format
    am: string; // number of nanocoins to send as a decimal string
    p?: string; // raw one-cell BoC encoded in Base64
    si?: string; // raw one-cell BoC encoded in Base64
    ec?: Record<string, string>; // extra currencies to send with the message
}

export interface SendJettonItem {
    t: 'jetton';
    ma: string; // jetton master contract address
    qi?: number; // arbitrary request number
    ja: string; // amount of transferring jettons in elementary units
    d: string; // address of the new owner of the jettons
    rd?: string; // address where to send a response with confirmation of a successful transfer and the rest of the incoming message Toncoins. If omitted, user's address MUST be used
    cp?: string; // raw one-cell BoC encoded in Base64 custom data (used by either sender or receiver jetton wallet for inner logic)
    fta?: string; // amount of nanotons to be sent to the destination address
    fp?: string; // Base64-encoded custom data that should be sent to the destination address with notification
}

export interface SendNftItem {
    t: 'nft';
    na: string; // address of the NFT item to transfer
    qi?: number; // arbitrary request number
    no: string; // address of the new owner of the NFT item
    rd?: string; // address where to send a response with confirmation of a successful transfer and the rest of the incoming message Toncoins. If omitted, user's address MUST be used
    cp?: string; // raw one-cell BoC encoded in Base64 custom data (used by either sender or receiver NFT wallet for inner logic)
    fta?: string; // amount of nanotons to be sent to the destination address
    fp?: string; // Base64-encoded custom data that should be sent to the destination address with notification
}

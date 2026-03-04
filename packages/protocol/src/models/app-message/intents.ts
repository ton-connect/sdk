import { ConnectRequest } from './connect-request';
import {
    SendTransactionRpcResponse,
    SignDataPayload,
    SignDataRpcResponse
} from '../wallet-message';

// TODO: in protocol add sign messages as send tx and sign data
// TODO: refactor by folders
// TODO: describe field (at least full names)
export interface BaseIntentPayload {
    id: string;
    m: 'txIntent' | 'signIntent' | 'signMsg' | 'actionIntent';
    c?: ConnectRequest;
}

export interface SendTransactionIntentRequest extends BaseIntentPayload {
    m: 'txIntent';
    vu?: number;
    n?: string;
    i: IntentItem[];
}

export interface SignDataIntentRequest extends BaseIntentPayload {
    m: 'signIntent';
    n?: string;
    mu: string;
    p: SignDataPayload;
}

export interface SignMessageIntentRequest extends BaseIntentPayload {
    m: 'signMsg';
    vu?: number;
    n?: string;
    i: IntentItem[];
}

export interface SendActionIntentRequest extends BaseIntentPayload {
    m: 'actionIntent';
    a: string;
}

export type IntentRequest =
    | SendTransactionIntentRequest
    | SignDataIntentRequest
    | SignMessageIntentRequest
    | SendActionIntentRequest;

export interface SendTonItem {
    t: 'ton';
    a: string;
    am: string;
    p?: string;
    si?: string;
    ec?: Record<string, string>;
}

export interface SendJettonItem {
    t: 'jetton';
    ma: string;
    qi?: number;
    ja: string;
    d: string;
    am?: string;
    rd?: string;
    cp?: string;
    fta?: string;
    fp?: string;
}

export interface SendNftItem {
    t: 'nft';
    na: string;
    qi?: number;
    no: string;
    am?: string;
    rd?: string;
    cp?: string;
    fta?: string;
    fp?: string;
}

export type IntentItem = SendTonItem | SendJettonItem | SendNftItem;

export type IntentResponse = SendTransactionRpcResponse | SignDataRpcResponse; // TODO: add sign message. Add

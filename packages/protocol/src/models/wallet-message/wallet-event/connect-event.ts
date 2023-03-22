import { CHAIN } from '../../CHAIN';
import { DeviceInfo } from '../../device-info';

export type ConnectEvent = ConnectEventSuccess | ConnectEventError;

export interface ConnectEventSuccess {
    event: 'connect';
    id: number;
    payload: {
        items: ConnectItemReply[];
        device: DeviceInfo;
    };
}

export interface ConnectEventError {
    event: 'connect_error';
    id: number;
    payload: {
        code: CONNECT_EVENT_ERROR_CODES;
        message: string;
    };
}

export enum CONNECT_EVENT_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    BAD_REQUEST_ERROR = 1,
    MANIFEST_NOT_FOUND_ERROR = 2,
    MANIFEST_CONTENT_ERROR = 3,
    UNKNOWN_APP_ERROR = 100,
    USER_REJECTS_ERROR = 300,
    METHOD_NOT_SUPPORTED = 400
}

export type ConnectItemReply = TonAddressItemReply | TonProofItemReply;

export interface TonAddressItemReply {
    name: 'ton_addr';
    address: string;
    network: CHAIN;
    walletStateInit: string;
    publicKey: string;
}

export type TonProofItemReply = TonProofItemReplySuccess | TonProofItemReplyError;

export interface TonProofItemReplySuccess {
    name: 'ton_proof';
    proof: {
        timestamp: number;
        domain: {
            lengthBytes: number;
            value: string;
        };
        payload: string;
        signature: string;
    };
}

export type TonProofItemReplyError = ConnectItemReplyError<TonProofItemReplySuccess['name']>;

export enum CONNECT_ITEM_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    METHOD_NOT_SUPPORTED = 400
}

export type ConnectItemReplyError<T> = {
    name: T;
    error: {
        code: CONNECT_ITEM_ERROR_CODES;
        message?: string;
    };
};

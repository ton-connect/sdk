import { CHAIN } from '../../CHAIN';
import { DeviceInfo } from '../../device-info';

export type ConnectEvent = ConnectEventSuccess | ConnectEventError;

export interface ConnectEventSuccess {
    event: 'connect';
    payload: {
        items: ConnectItemReply[];
        device: DeviceInfo;
    };
}

export interface ConnectEventError {
    event: 'connect_error';
    payload: {
        code: CONNECT_EVENT_ERROR_CODES;
        message: string;
    };
}

export enum CONNECT_EVENT_ERROR_CODES {
    BAD_REQUEST = -1,
    UNKNOWN_ERROR = 0,
    USER_REJECTS_ERROR = 1,
    AUTO_CONNECT_UNKNOWN_APP_ERROR = 2
}

export type ConnectItemReply = TonAddressItemReply | TonProofItemReply;

export interface TonAddressItemReply {
    name: 'ton_addr';
    address: string;
    network: CHAIN;
}

export interface TonProofItemReply {
    name: 'ton_proof';
    signature: string;
}

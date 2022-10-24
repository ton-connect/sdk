import { UserRejectsError } from 'src/errors';
import { UnknownError } from 'src/errors/unknown.error';
import { DeviceInfo } from 'src/models/wallet';

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
        code: keyof typeof connectEventErrors;
        message: string;
    };
}

export const connectEventErrors = {
    0: UnknownError,
    1: UserRejectsError
};

export type ConnectItemReply = TonAddressItemReply | TonProofItemReply;

export interface TonAddressItemReply {
    name: 'ton_addr';
    address: string;
    network: string;
}

export interface TonProofItemReply {
    name: 'ton_proof';
    signature: string;
}

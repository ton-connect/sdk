import { DeviceInfo, TonAddressItemReply } from '@tonconnect/protocol';
import { BridgeSessionRaw } from 'src/provider/bridge/models/bridge-session-raw';
import { BridgeSession } from './bridge-session';

export type BridgeConnection = BridgeConnectionHttp | BridgeConnectionInjected;

export interface BridgeConnectionInjected {
    type: 'injected';
    jsBridgeKey: string;
    nextRpcRequestId: number;
}

export interface BridgeConnectionHttp {
    type: 'http';
    lastWalletEventId?: number;
    nextRpcRequestId: number;
    connectEvent: {
        event: 'connect';
        payload: {
            items: [TonAddressItemReply];
            device: DeviceInfo;
        };
    };
    session: BridgeSession;
}

export type BridgeConnectionHttpRaw = Omit<BridgeConnectionHttp, 'session'> & {
    session: BridgeSessionRaw;
};

export type BridgeConnectionRaw = BridgeConnectionHttpRaw | BridgeConnectionInjected;

import { DeviceInfo, KeyPair, SessionCrypto, TonAddressItemReply } from '@tonconnect/protocol';
import { BridgeSessionRaw } from 'src/provider/bridge/models/bridge-session-raw';
import { BridgeSession } from './bridge-session';
import { WalletConnectionSourceHTTP } from 'src/models';
import { Optional } from 'src/utils/types';

export type BridgeConnection =
    | BridgeConnectionHttp
    | BridgePendingConnectionHttp
    | BridgeConnectionInjected;

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

export interface BridgePendingConnectionHttp {
    type: 'http';
    sessionCrypto: SessionCrypto;
    connectionSource:
        | Optional<WalletConnectionSourceHTTP, 'universalLink'>
        | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[];
}

export function isPendingConnectionHttp(
    connection: BridgePendingConnectionHttp | BridgeConnectionHttp
): connection is BridgePendingConnectionHttp {
    return !('connectEvent' in connection);
}

export type BridgeConnectionHttpRaw = Omit<BridgeConnectionHttp, 'session'> & {
    session: BridgeSessionRaw;
};

export type BridgePendingConnectionHttpRaw = Omit<BridgePendingConnectionHttp, 'sessionCrypto'> & {
    sessionCrypto: KeyPair;
};

export type BridgeConnectionRaw =
    | BridgeConnectionHttpRaw
    | BridgePendingConnectionHttpRaw
    | BridgeConnectionInjected;

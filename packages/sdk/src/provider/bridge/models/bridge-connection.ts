import { ConnectEventSuccess } from '@tonconnect/protocol';
import { BridgeSessionRaw } from './bridge-session-raw';
import { BridgeSession } from './bridge-session';

export interface BridgeConnection {
    connectEvent: ConnectEventSuccess;
    session: BridgeSession;
}

export interface BridgeConnectionRaw {
    connectEvent: ConnectEventSuccess;
    session: BridgeSessionRaw;
}

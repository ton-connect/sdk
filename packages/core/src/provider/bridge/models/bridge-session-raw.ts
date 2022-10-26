import { KeyPair } from '@ton-connect/protocol';
import { BridgeSession } from './bridge-session';

export type BridgeSessionRaw = Omit<BridgeSession, 'sessionCrypto'> & {
    sessionKeyPair: KeyPair;
};

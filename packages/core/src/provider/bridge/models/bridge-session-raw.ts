import { KeyPair } from 'src/models/crypto/keypair';
import { BridgeSession } from './bridge-session';

export type BridgeSessionRaw = Omit<BridgeSession, 'sessionKeyPair'> & {
    sessionKeyPair: KeyPair;
};

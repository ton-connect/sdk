import { SessionKeypair } from 'src/crypto/session-crypto';

export interface BridgeSession {
    sessionKeyPair: SessionKeypair;
    walletPublicKey: string;
    bridgeUrl: string;
}

export type BridgePartialSession = Omit<BridgeSession, 'walletPublicKey'>;

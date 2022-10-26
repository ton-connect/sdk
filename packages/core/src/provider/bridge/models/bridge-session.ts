import { SessionCrypto } from '@ton-connect/protocol';

export interface BridgeSession {
    sessionCrypto: SessionCrypto;
    walletPublicKey: string;
    bridgeUrl: string;
}

export type BridgePartialSession = Omit<BridgeSession, 'walletPublicKey'>;

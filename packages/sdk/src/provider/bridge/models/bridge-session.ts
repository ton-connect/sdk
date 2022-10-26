import { SessionCrypto } from '@tonconnect/protocol';
import { WalletConnectionSource } from 'src/models';

export interface BridgeSession {
    sessionCrypto: SessionCrypto;
    walletPublicKey: string;
    walletConnectionSource: WalletConnectionSource;
}

export type BridgePartialSession = Omit<BridgeSession, 'walletPublicKey'>;

import { SessionCrypto } from '@tonconnect/protocol';
import { WalletConnectionSourceHTTP } from 'src/models/wallet/wallet-connection-source';

export interface BridgeSession {
    sessionCrypto: SessionCrypto;
    walletPublicKey: string;
    walletConnectionSource: WalletConnectionSourceHTTP;
}

export type BridgePartialSession = Omit<BridgeSession, 'walletPublicKey'>;

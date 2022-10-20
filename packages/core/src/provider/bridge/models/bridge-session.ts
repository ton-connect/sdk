import { WalletConnectionSource } from 'src/models';
import { Keypair } from 'src/models/crypto/keypair';

export interface BridgeSessionSeed {
    walletConnectionSource: WalletConnectionSource;
    sessionId: string;
    keypair: Keypair;
    protocolVersion: string;
}

export interface BridgeSession extends BridgeSessionSeed {
    walletPk: string;
}

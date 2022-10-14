import { Keypair } from 'src/ton-connect/core/models/crypto/keypair';
import { WalletConnectionSource } from 'src/ton-connect/core/models/wallet/wallet-connection-source';

export interface BridgeSessionSeed {
    walletConnectionSource: WalletConnectionSource;
    sessionId: string;
    keypair: Keypair;
    protocolVersion: string;
}

export interface BridgeSession extends BridgeSessionSeed {
    walletPk: string;
}

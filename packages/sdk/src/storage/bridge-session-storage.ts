import { SessionCrypto } from '@tonconnect/protocol';
import { BridgeSession } from 'src/provider/bridge/models/bridge-session';
import { BridgeSessionRaw } from 'src/provider/bridge/models/bridge-session-raw';
import { IStorage } from 'src/storage/models/storage.interface';

export class BridgeSessionStorage {
    private readonly storeKey = 'ton-connect-storage_http-bridge-session';

    constructor(private readonly storage: IStorage) {}

    public async storeSession(session: BridgeSession): Promise<void> {
        const rawSession: BridgeSessionRaw = {
            sessionKeyPair: session.sessionCrypto.stringifyKeypair(),
            walletPublicKey: session.walletPublicKey,
            bridgeUrl: session.bridgeUrl
        };
        return this.storage.setItem(this.storeKey, JSON.stringify(rawSession));
    }

    public async removeSession(): Promise<void> {
        return this.storage.removeItem(this.storeKey);
    }

    public async getSession(): Promise<BridgeSession | null> {
        const stored = await this.storage.getItem(this.storeKey);
        if (!stored) {
            return null;
        }

        const rawSession: BridgeSessionRaw = JSON.parse(stored);
        const sessionCrypto = new SessionCrypto(rawSession.sessionKeyPair);
        return {
            sessionCrypto,
            bridgeUrl: rawSession.bridgeUrl,
            walletPublicKey: rawSession.walletPublicKey
        };
    }
}

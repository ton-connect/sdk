import { SessionCrypto } from '@tonconnect/protocol';
import { BridgeSessionRaw } from 'src/provider/bridge/models/bridge-session-raw';
import {
    BridgeConnection,
    BridgeConnectionRaw
} from 'src/provider/bridge/models/bridge-connection';
import { IStorage } from 'src/storage/models/storage.interface';

export class BridgeConnectionStorage {
    private readonly storeKey = 'ton-connect-storage_http-bridge-connection';

    constructor(private readonly storage: IStorage) {}

    public async storeConnection(connection: BridgeConnection): Promise<void> {
        const rawSession: BridgeSessionRaw = {
            sessionKeyPair: connection.session.sessionCrypto.stringifyKeypair(),
            walletPublicKey: connection.session.walletPublicKey,
            bridgeUrl: connection.session.bridgeUrl
        };

        const rawConnection: BridgeConnectionRaw = {
            session: rawSession,
            connectEvent: connection.connectEvent
        };
        return this.storage.setItem(this.storeKey, JSON.stringify(rawConnection));
    }

    public async removeConnection(): Promise<void> {
        return this.storage.removeItem(this.storeKey);
    }

    public async getConnection(): Promise<BridgeConnection | null> {
        const stored = await this.storage.getItem(this.storeKey);
        if (!stored) {
            return null;
        }

        const rawConnection: BridgeConnectionRaw = JSON.parse(stored);
        const sessionCrypto = new SessionCrypto(rawConnection.session.sessionKeyPair);
        return {
            connectEvent: rawConnection.connectEvent,
            session: {
                sessionCrypto,
                bridgeUrl: rawConnection.session.bridgeUrl,
                walletPublicKey: rawConnection.session.walletPublicKey
            }
        };
    }

    public async storedConnectionExists(): Promise<boolean> {
        const stored = await this.storage.getItem(this.storeKey);
        return !!stored;
    }
}

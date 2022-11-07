import { SessionCrypto } from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors';
import { BridgeSessionRaw } from 'src/provider/bridge/models/bridge-session-raw';
import {
    BridgeConnection,
    BridgeConnectionHttp,
    BridgeConnectionHttpRaw,
    BridgeConnectionInjected,
    BridgeConnectionRaw
} from 'src/provider/bridge/models/bridge-connection';
import { IStorage } from 'src/storage/models/storage.interface';

export class BridgeConnectionStorage {
    private readonly storeKey = 'ton-connect-storage_bridge-connection';

    constructor(private readonly storage: IStorage) {}

    public async storeConnection(connection: BridgeConnection): Promise<void> {
        if (connection.type === 'injected') {
            return this.storage.setItem(this.storeKey, JSON.stringify(connection));
        }

        const rawSession: BridgeSessionRaw = {
            sessionKeyPair: connection.session.sessionCrypto.stringifyKeypair(),
            walletPublicKey: connection.session.walletPublicKey,
            walletConnectionSource: connection.session.walletConnectionSource
        };

        const rawConnection: BridgeConnectionHttpRaw = {
            type: 'http',
            connectEvent: connection.connectEvent,
            session: rawSession
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

        const connection: BridgeConnectionRaw = JSON.parse(stored);

        if (connection.type === 'injected') {
            return connection;
        }

        const sessionCrypto = new SessionCrypto(connection.session.sessionKeyPair);
        return {
            type: 'http',
            connectEvent: connection.connectEvent,
            session: {
                sessionCrypto,
                walletConnectionSource: connection.session.walletConnectionSource,
                walletPublicKey: connection.session.walletPublicKey
            }
        };
    }

    public async getHttpConnection(): Promise<BridgeConnectionHttp> {
        const connection = await this.getConnection();
        if (!connection) {
            throw new TonConnectError(
                'Trying to read HTTP connection source while nothing is stored'
            );
        }

        if (connection.type === 'injected') {
            throw new TonConnectError(
                'Trying to read HTTP connection source while injected connection is stored'
            );
        }

        return connection;
    }

    public async getInjectedConnection(): Promise<BridgeConnectionInjected> {
        const connection = await this.getConnection();

        if (!connection) {
            throw new TonConnectError(
                'Trying to read Injected bridge connection source while nothing is stored'
            );
        }

        if (connection?.type === 'http') {
            throw new TonConnectError(
                'Trying to read Injected bridge connection source while HTTP connection is stored'
            );
        }

        return connection;
    }

    public async storedConnectionType(): Promise<BridgeConnection['type'] | null> {
        const stored = await this.storage.getItem(this.storeKey);
        if (!stored) {
            return null;
        }
        const connection: BridgeConnection = JSON.parse(stored);
        return connection.type;
    }
}

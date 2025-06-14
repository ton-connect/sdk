import { SessionCrypto } from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors';
import { BridgeSessionRaw } from 'src/provider/bridge/models/bridge-session-raw';
import {
    BridgeConnection,
    BridgeConnectionHttp,
    BridgeConnectionHttpRaw,
    BridgeConnectionInjected,
    BridgeConnectionRaw,
    BridgePendingConnectionHttp,
    BridgePendingConnectionHttpRaw,
    isPendingConnectionHttp
} from 'src/provider/bridge/models/bridge-connection';
import { IStorage } from 'src/storage/models/storage.interface';

export class BridgeConnectionStorage {
    private readonly storeKey = 'ton-connect-storage_bridge-connection';

    constructor(private readonly storage: IStorage) {}

    public async storeConnection(connection: BridgeConnection): Promise<void> {
        if (connection.type === 'injected') {
            return this.storage.setItem(this.storeKey, JSON.stringify(connection));
        }

        if (!isPendingConnectionHttp(connection)) {
            const rawSession: BridgeSessionRaw = {
                sessionKeyPair: connection.session.sessionCrypto.stringifyKeypair(),
                walletPublicKey: connection.session.walletPublicKey,
                bridgeUrl: connection.session.bridgeUrl
            };

            const rawConnection: BridgeConnectionHttpRaw = {
                type: 'http',
                connectEvent: connection.connectEvent,
                session: rawSession,
                lastWalletEventId: connection.lastWalletEventId,
                nextRpcRequestId: connection.nextRpcRequestId
            };
            return this.storage.setItem(this.storeKey, JSON.stringify(rawConnection));
        }

        const rawConnection: BridgePendingConnectionHttpRaw = {
            type: 'http',
            connectionSource: connection.connectionSource,
            sessionCrypto: connection.sessionCrypto.stringifyKeypair()
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

        if ('connectEvent' in connection) {
            const sessionCrypto = new SessionCrypto(connection.session.sessionKeyPair);
            return {
                type: 'http',
                connectEvent: connection.connectEvent,
                lastWalletEventId: connection.lastWalletEventId,
                nextRpcRequestId: connection.nextRpcRequestId,
                session: {
                    sessionCrypto,
                    bridgeUrl: connection.session.bridgeUrl,
                    walletPublicKey: connection.session.walletPublicKey
                }
            };
        }

        return {
            type: 'http',
            sessionCrypto: new SessionCrypto(connection.sessionCrypto),
            connectionSource: connection.connectionSource
        };
    }

    public async getHttpConnection(): Promise<BridgeConnectionHttp | BridgePendingConnectionHttp> {
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

    public async getHttpPendingConnection(): Promise<BridgePendingConnectionHttp> {
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

        if (!isPendingConnectionHttp(connection)) {
            throw new TonConnectError(
                'Trying to read HTTP-pending connection while http connection is stored'
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

    public async storeLastWalletEventId(id: number): Promise<void> {
        const connection = await this.getConnection();
        if (connection && connection.type === 'http' && !isPendingConnectionHttp(connection)) {
            connection.lastWalletEventId = id;
            return this.storeConnection(connection);
        }
    }

    public async getLastWalletEventId(): Promise<number | undefined> {
        const connection = await this.getConnection();
        if (connection && 'lastWalletEventId' in connection) {
            return connection.lastWalletEventId;
        }

        return undefined;
    }

    public async increaseNextRpcRequestId(): Promise<void> {
        const connection = await this.getConnection();
        if (connection && 'nextRpcRequestId' in connection) {
            const lastId = connection.nextRpcRequestId || 0;
            connection.nextRpcRequestId = lastId + 1;
            return this.storeConnection(connection);
        }
    }

    public async getNextRpcRequestId(): Promise<number> {
        const connection = await this.getConnection();
        if (connection && 'nextRpcRequestId' in connection) {
            return connection.nextRpcRequestId || 0;
        }

        return 0;
    }
}

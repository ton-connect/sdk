import { SessionCrypto } from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors';
import { BridgeSessionRaw } from 'src/provider/bridge/models/bridge-session-raw';
import {
    BridgeConnection,
    BridgeConnectionHttp,
    BridgeConnectionHttpRaw,
    BridgeConnectionInjected,
    BridgeConnectionRaw,
    BridgeConnectionWalletConnect,
    BridgePendingConnectionHttp,
    BridgePendingConnectionHttpRaw,
    isExpiredPendingConnectionHttpRaw,
    isPendingConnectionHttp,
    isPendingConnectionHttpRaw
} from 'src/provider/bridge/models/bridge-connection';
import { IStorage } from 'src/storage/models/storage.interface';
import { logDebug } from 'src/utils/log';
import { WalletsListManager } from 'src/wallets-list-manager';

export class BridgeConnectionStorage {
    private readonly storeKey = 'ton-connect-storage_bridge-connection';

    constructor(
        public readonly storage: IStorage,
        private readonly walletsListManager: WalletsListManager
    ) {}

    public async storeConnection(connection: BridgeConnection): Promise<void> {
        if (connection.type === 'injected' || connection.type === 'wallet-connect') {
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
            sessionCrypto: connection.sessionCrypto.stringifyKeypair(),
            createdAt: Date.now()
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

        if (connection.type === 'injected' || connection.type === 'wallet-connect') {
            return connection;
        }

        if (!isPendingConnectionHttpRaw(connection)) {
            const sessionCrypto = new SessionCrypto(connection.session.sessionKeyPair);
            return this.actualizeBridgeConnection({
                type: 'http',
                connectEvent: connection.connectEvent,
                lastWalletEventId: connection.lastWalletEventId,
                nextRpcRequestId: connection.nextRpcRequestId,
                session: {
                    sessionCrypto,
                    bridgeUrl: connection.session.bridgeUrl,
                    walletPublicKey: connection.session.walletPublicKey
                }
            });
        }

        if (isExpiredPendingConnectionHttpRaw(connection)) {
            await this.removeConnection();
            return null;
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

        if (connection.type !== 'http') {
            throw new TonConnectError(
                `Trying to read HTTP connection source while ${connection.type} connection is stored`
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

        if (connection.type !== 'http') {
            throw new TonConnectError(
                `Trying to read HTTP connection source while ${connection.type} connection is stored`
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

        if (connection?.type !== 'injected') {
            throw new TonConnectError(
                `Trying to read Injected bridge connection source while ${connection.type} connection is stored`
            );
        }

        return connection;
    }

    public async getWalletConnectConnection(): Promise<BridgeConnectionWalletConnect> {
        const connection = await this.getConnection();
        if (!connection) {
            throw new TonConnectError(
                'Trying to read wallet connect bridge connection source while nothing is stored'
            );
        }

        if (connection?.type !== 'wallet-connect') {
            throw new TonConnectError(
                `Trying to read wallet connect bridge connection source while ${connection.type} connection is stored`
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

    private async actualizeBridgeConnection(
        connection: BridgeConnectionHttp
    ): Promise<BridgeConnectionHttp> {
        try {
            const appName = connection.connectEvent.payload.device.appName;
            const wallet = await this.walletsListManager.getRemoteWallet(appName);

            if (wallet.bridgeUrl === connection.session.bridgeUrl) {
                return connection;
            }

            const actualizedConnection = {
                ...connection,
                session: {
                    ...connection.session,
                    bridgeUrl: wallet.bridgeUrl
                }
            } satisfies BridgeConnectionHttp;

            await this.storeConnection(connection);

            return actualizedConnection;
        } catch (error) {
            logDebug('Failed to actualize bridge connection', error);
            return connection;
        }
    }
}

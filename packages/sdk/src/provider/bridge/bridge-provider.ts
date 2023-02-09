import {
    Base64,
    SessionCrypto,
    AppRequest,
    ConnectRequest,
    RpcMethod,
    WalletEvent,
    WalletResponse,
    WalletMessage,
    hexToByteArray,
    ConnectEventSuccess,
    TonAddressItemReply
} from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors/ton-connect.error';
import { WalletConnectionSourceHTTP } from 'src/models/wallet/wallet-connection-source';
import { BridgeGateway } from 'src/provider/bridge/bridge-gateway';
import { BridgeConnectionHttp } from 'src/provider/bridge/models/bridge-connection';
import { BridgeIncomingMessage } from 'src/provider/bridge/models/bridge-incomming-message';
import { BridgePartialSession, BridgeSession } from 'src/provider/bridge/models/bridge-session';
import { HTTPProvider } from 'src/provider/provider';
import { BridgeConnectionStorage } from 'src/storage/bridge-connection-storage';
import { IStorage } from 'src/storage/models/storage.interface';
import { WithoutId, WithoutIdDistributive } from 'src/utils/types';
import { PROTOCOL_VERSION } from 'src/resources/protocol';

export class BridgeProvider implements HTTPProvider {
    public static async fromStorage(storage: IStorage): Promise<BridgeProvider> {
        const bridgeConnectionStorage = new BridgeConnectionStorage(storage);
        const connection = await bridgeConnectionStorage.getHttpConnection();
        return new BridgeProvider(storage, connection.session.walletConnectionSource);
    }

    public readonly type = 'http';

    private readonly connectionStorage: BridgeConnectionStorage;

    private readonly pendingRequests = new Map<
        string,
        (response: WithoutId<WalletResponse<RpcMethod>>) => void
    >();

    private nextRequestId = 0;

    private session: BridgeSession | BridgePartialSession | null = null;

    private bridge: BridgeGateway | null = null;

    private listeners: Array<(e: WithoutIdDistributive<WalletEvent>) => void> = [];

    constructor(
        private readonly storage: IStorage,
        private readonly walletConnectionSource: WalletConnectionSourceHTTP
    ) {
        this.connectionStorage = new BridgeConnectionStorage(storage);
    }

    public connect(message: ConnectRequest): string {
        this.bridge?.close();
        const sessionCrypto = new SessionCrypto();

        this.session = {
            sessionCrypto,
            walletConnectionSource: this.walletConnectionSource
        };

        this.bridge = new BridgeGateway(
            this.storage,
            this.walletConnectionSource.bridgeUrl,
            sessionCrypto.sessionId,
            this.gatewayListener.bind(this),
            this.gatewayErrorsListener.bind(this)
        );
        this.bridge.registerSession();

        return this.generateUniversalLink(message);
    }

    public async restoreConnection(): Promise<void> {
        this.bridge?.close();
        const storedConnection = await this.connectionStorage.getHttpConnection();
        if (!storedConnection) {
            return;
        }

        this.session = storedConnection.session;

        this.bridge = new BridgeGateway(
            this.storage,
            this.walletConnectionSource.bridgeUrl,
            storedConnection.session.sessionCrypto.sessionId,
            this.gatewayListener.bind(this),
            this.gatewayErrorsListener.bind(this)
        );

        await this.bridge.registerSession();

        this.listeners.forEach(listener => listener(storedConnection.connectEvent));
    }

    public sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>
    ): Promise<WithoutId<WalletResponse<T>>> {
        return new Promise((resolve, reject) => {
            const id = this.nextRequestId;
            this.nextRequestId++;
            if (!this.bridge || !this.session || !('walletPublicKey' in this.session)) {
                throw new TonConnectError('Trying to send bridge request without session');
            }

            const encodedRequest = this.session!.sessionCrypto.encrypt(
                JSON.stringify({ ...request, id }),
                hexToByteArray(this.session.walletPublicKey)
            );

            this.bridge.send(encodedRequest, this.session.walletPublicKey).catch(reject);
            this.pendingRequests.set(id.toString(), resolve);
        });
    }

    public closeConnection(): void {
        this.bridge?.close();
        this.listeners = [];
        this.session = null;
        this.bridge = null;
    }

    public async disconnect(): Promise<void> {
        this.sendRequest({ method: 'disconnect', params: [] }).catch(e => console.debug(e));
        this.bridge?.close();
        this.listeners = [];
        return this.removeBridgeAndSession();
    }

    public listen(callback: (e: WithoutIdDistributive<WalletEvent>) => void): () => void {
        this.listeners.push(callback);
        return () => (this.listeners = this.listeners.filter(listener => listener !== callback));
    }

    private async gatewayListener(bridgeIncomingMessage: BridgeIncomingMessage): Promise<void> {
        const walletMessage: WalletMessage = JSON.parse(
            this.session!.sessionCrypto.decrypt(
                Base64.decode(bridgeIncomingMessage.message).toUint8Array(),
                hexToByteArray(bridgeIncomingMessage.from)
            )
        );

        if (!('event' in walletMessage)) {
            const id = walletMessage.id.toString();
            const resolve = this.pendingRequests.get(id);
            if (!resolve) {
                throw new TonConnectError(`Response id ${id} doesn't match any request's id`);
            }

            resolve(walletMessage);
            this.pendingRequests.delete(id);
            return;
        }

        if (walletMessage.event === 'connect') {
            await this.updateSession(walletMessage, bridgeIncomingMessage.from);
        }

        if (walletMessage.event === 'disconnect') {
            await this.removeBridgeAndSession();
        }

        this.listeners.forEach(listener => listener(walletMessage));
    }

    private async gatewayErrorsListener(e: Event): Promise<void> {
        throw new TonConnectError(`Bridge error ${JSON.stringify(e)}`);
    }

    private async updateSession(
        connectEvent: ConnectEventSuccess,
        walletPublicKey: string
    ): Promise<void> {
        this.session = {
            ...this.session!,
            walletPublicKey
        };

        const tonAddrItem: TonAddressItemReply = connectEvent.payload.items.find(
            item => item.name === 'ton_addr'
        ) as TonAddressItemReply;

        const connectEventToSave: BridgeConnectionHttp['connectEvent'] = {
            ...connectEvent,
            payload: {
                ...connectEvent.payload,
                items: [tonAddrItem]
            }
        };

        await this.connectionStorage.storeConnection({
            type: 'http',
            session: this.session,
            connectEvent: connectEventToSave
        });
    }

    private async removeBridgeAndSession(): Promise<void> {
        this.session = null;
        this.bridge = null;
        await this.connectionStorage.removeConnection();
    }

    private generateUniversalLink(message: ConnectRequest): string {
        const url = new URL(this.walletConnectionSource.universalLink);
        url.searchParams.append('v', PROTOCOL_VERSION.toString());
        url.searchParams.append('id', this.session!.sessionCrypto.sessionId);
        url.searchParams.append('r', JSON.stringify(message));
        return url.toString();
    }
}

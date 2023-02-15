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

    private readonly standardUniversalLink = 'tc://';

    private readonly connectionStorage: BridgeConnectionStorage;

    private readonly pendingRequests = new Map<
        string,
        (response: WithoutId<WalletResponse<RpcMethod>>) => void
    >();

    private nextRequestId = Math.floor(Date.now() / 2 - Math.random() * 1000);

    private session: BridgeSession | BridgePartialSession | null = null;

    private gateway: BridgeGateway | null = null;

    private pendingGateways: BridgeGateway[] = [];

    private listeners: Array<(e: WithoutIdDistributive<WalletEvent>) => void> = [];

    constructor(
        private readonly storage: IStorage,
        private readonly walletConnectionSource:
            | WalletConnectionSourceHTTP
            | WalletConnectionSourceHTTP[]
    ) {
        this.connectionStorage = new BridgeConnectionStorage(storage);
    }

    public connect(message: ConnectRequest): string {
        this.closeGateways();
        const sessionCrypto = new SessionCrypto();

        let walletConnectionSource: WalletConnectionSourceHTTP = {
            universalLink: this.standardUniversalLink,
            bridgeUrl: ''
        };

        if (Array.isArray(this.walletConnectionSource)) {
            this.pendingGateways = this.walletConnectionSource.map(source => {
                const gateway = new BridgeGateway(
                    this.storage,
                    source.bridgeUrl,
                    sessionCrypto.sessionId,
                    () => {},
                    e => {
                        console.error(e);
                    }
                );

                gateway.setListener(message =>
                    this.pendingGatewaysListener(gateway, source, message)
                );

                return gateway;
            });

            this.pendingGateways.forEach(bridge => bridge.registerSession());
        } else {
            walletConnectionSource = this.walletConnectionSource;

            this.gateway = new BridgeGateway(
                this.storage,
                this.walletConnectionSource.bridgeUrl,
                sessionCrypto.sessionId,
                this.gatewayListener.bind(this),
                this.gatewayErrorsListener.bind(this)
            );
            this.gateway.registerSession();
        }

        this.session = {
            sessionCrypto,
            walletConnectionSource
        };

        return this.generateUniversalLink(walletConnectionSource.universalLink, message);
    }

    public async restoreConnection(): Promise<void> {
        if (Array.isArray(this.walletConnectionSource)) {
            throw new TonConnectError(
                'Internal error. Connection source is array while WalletConnectionSourceHTTP was expected.'
            );
        }

        this.closeGateways();
        const storedConnection = await this.connectionStorage.getHttpConnection();
        if (!storedConnection) {
            return;
        }

        this.session = storedConnection.session;

        this.gateway = new BridgeGateway(
            this.storage,
            this.walletConnectionSource.bridgeUrl,
            storedConnection.session.sessionCrypto.sessionId,
            this.gatewayListener.bind(this),
            this.gatewayErrorsListener.bind(this)
        );

        await this.gateway.registerSession();

        this.listeners.forEach(listener => listener(storedConnection.connectEvent));
    }

    public sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>
    ): Promise<WithoutId<WalletResponse<T>>> {
        return new Promise((resolve, reject) => {
            const id = this.nextRequestId;
            this.nextRequestId++;
            if (!this.gateway || !this.session || !('walletPublicKey' in this.session)) {
                throw new TonConnectError('Trying to send bridge request without session');
            }

            const encodedRequest = this.session!.sessionCrypto.encrypt(
                JSON.stringify({ ...request, id }),
                hexToByteArray(this.session.walletPublicKey)
            );

            this.gateway
                .send(encodedRequest, this.session.walletPublicKey, request.method)
                .catch(reject);
            this.pendingRequests.set(id.toString(), resolve);
        });
    }

    public closeConnection(): void {
        this.closeGateways();
        this.listeners = [];
        this.session = null;
        this.gateway = null;
    }

    public disconnect(): Promise<void> {
        this.sendRequest({ method: 'disconnect', params: [] }).catch(e => console.debug(e));
        this.closeGateways();
        this.listeners = [];
        return this.removeBridgeAndSession();
    }

    public listen(callback: (e: WithoutIdDistributive<WalletEvent>) => void): () => void {
        this.listeners.push(callback);
        return () => (this.listeners = this.listeners.filter(listener => listener !== callback));
    }

    public pause(): void {
        this.gateway?.pause();
        this.pendingGateways.forEach(bridge => bridge.pause());
    }

    public async unPause(): Promise<void> {
        const promises = this.pendingGateways.map(bridge => bridge.unPause());
        if (this.gateway) {
            promises.push(this.gateway.unPause());
        }
        await Promise.all(promises);
    }

    private async pendingGatewaysListener(
        gateway: BridgeGateway,
        walletConnectionSource: WalletConnectionSourceHTTP,
        bridgeIncomingMessage: BridgeIncomingMessage
    ): Promise<void> {
        if (!this.pendingGateways.includes(gateway)) {
            gateway.close();
            return;
        }

        this.closeGateways({ except: gateway });

        this.session!.walletConnectionSource = walletConnectionSource;
        this.gateway = gateway;
        this.gateway.setErrorsListener(this.gatewayErrorsListener.bind(this));
        this.gateway.setListener(this.gatewayListener.bind(this));
        return this.gatewayListener(bridgeIncomingMessage);
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
                console.error(`Response id ${id} doesn't match any request's id`);
                return;
            }

            resolve(walletMessage);
            this.pendingRequests.delete(id);
            return;
        }

        if (walletMessage.id !== undefined) {
            const lastId = await this.connectionStorage.getLastWalletEventId();

            if (lastId !== undefined && walletMessage.id <= lastId) {
                console.error(
                    `Received event id (=${walletMessage.id}) must be greater than stored last wallet event id (=${lastId}) `
                );
            }

            await this.connectionStorage.storeLastWalletEventId(walletMessage.id);
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
        this.gateway = null;
        await this.connectionStorage.removeConnection();
    }

    private generateUniversalLink(universalLink: string, message: ConnectRequest): string {
        const url = new URL(universalLink);
        url.searchParams.append('v', PROTOCOL_VERSION.toString());
        url.searchParams.append('id', this.session!.sessionCrypto.sessionId);
        url.searchParams.append('r', JSON.stringify(message));
        return url.toString();
    }

    private closeGateways(options?: { except: BridgeGateway }): void {
        this.gateway?.close();
        this.pendingGateways
            .filter(item => item !== options?.except)
            .forEach(bridge => bridge.close());
        this.pendingGateways = [];
    }
}

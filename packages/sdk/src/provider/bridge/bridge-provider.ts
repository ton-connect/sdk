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
import {
    BridgeConnectionHttp,
    isPendingConnectionHttp
} from 'src/provider/bridge/models/bridge-connection';
import { BridgeIncomingMessage } from 'src/provider/bridge/models/bridge-incomming-message';
import { BridgePartialSession, BridgeSession } from 'src/provider/bridge/models/bridge-session';
import { HTTPProvider } from 'src/provider/provider';
import { BridgeConnectionStorage } from 'src/storage/bridge-connection-storage';
import { IStorage } from 'src/storage/models/storage.interface';
import { Optional, WithoutId, WithoutIdDistributive } from 'src/utils/types';
import { PROTOCOL_VERSION } from 'src/resources/protocol';
import { logDebug, logError } from 'src/utils/log';
import { encodeTelegramUrlParameters, isTelegramUrl } from 'src/utils/url';

export class BridgeProvider implements HTTPProvider {
    public static async fromStorage(storage: IStorage): Promise<BridgeProvider> {
        const bridgeConnectionStorage = new BridgeConnectionStorage(storage);
        const connection = await bridgeConnectionStorage.getHttpConnection();

        if (isPendingConnectionHttp(connection)) {
            return new BridgeProvider(storage, connection.connectionSource);
        }
        return new BridgeProvider(storage, { bridgeUrl: connection.session.bridgeUrl });
    }

    public readonly type = 'http';

    private readonly standardUniversalLink = 'tc://';

    private readonly connectionStorage: BridgeConnectionStorage;

    private readonly pendingRequests = new Map<
        string,
        (response: WithoutId<WalletResponse<RpcMethod>>) => void
    >();

    private session: BridgeSession | BridgePartialSession | null = null;

    private gateway: BridgeGateway | null = null;

    private pendingGateways: BridgeGateway[] = [];

    private listeners: Array<(e: WithoutIdDistributive<WalletEvent>) => void> = [];

    constructor(
        private readonly storage: IStorage,
        private readonly walletConnectionSource:
            | Optional<WalletConnectionSourceHTTP, 'universalLink'>
            | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[]
    ) {
        this.connectionStorage = new BridgeConnectionStorage(storage);
    }

    public connect(message: ConnectRequest): string {
        this.closeGateways();

        const sessionCrypto = new SessionCrypto();

        this.session = {
            sessionCrypto,
            bridgeUrl:
                'bridgeUrl' in this.walletConnectionSource
                    ? this.walletConnectionSource.bridgeUrl
                    : ''
        };

        this.connectionStorage
            .storeConnection({
                type: 'http',
                connectionSource: this.walletConnectionSource,
                sessionCrypto
            })
            .then(() => this.openGateways(sessionCrypto));

        const universalLink =
            'universalLink' in this.walletConnectionSource &&
            this.walletConnectionSource.universalLink
                ? this.walletConnectionSource.universalLink
                : this.standardUniversalLink;

        return this.generateUniversalLink(universalLink, message);
    }

    public async restoreConnection(): Promise<void> {
        this.closeGateways();
        const storedConnection = await this.connectionStorage.getHttpConnection();
        if (!storedConnection) {
            return;
        }

        if (isPendingConnectionHttp(storedConnection)) {
            this.session = {
                sessionCrypto: storedConnection.sessionCrypto,
                bridgeUrl:
                    'bridgeUrl' in this.walletConnectionSource
                        ? this.walletConnectionSource.bridgeUrl
                        : ''
            };

            return this.openGateways(storedConnection.sessionCrypto, { openingDeadlineMS: 5000 });
        }

        if (Array.isArray(this.walletConnectionSource)) {
            throw new TonConnectError(
                'Internal error. Connection source is array while WalletConnectionSourceHTTP was expected.'
            );
        }

        this.session = storedConnection.session;

        this.gateway = new BridgeGateway(
            this.storage,
            this.walletConnectionSource.bridgeUrl,
            storedConnection.session.sessionCrypto.sessionId,
            this.gatewayListener.bind(this),
            this.gatewayErrorsListener.bind(this)
        );

        try {
            await this.gateway.registerSession({ openingDeadlineMS: 5000 });
        } catch (e) {
            await this.disconnect();
            return;
        }

        this.listeners.forEach(listener => listener(storedConnection.connectEvent));
    }

    public sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>,
        onRequestSent?: () => void
    ): Promise<WithoutId<WalletResponse<T>>> {
        return new Promise(async (resolve, reject) => {
            if (!this.gateway || !this.session || !('walletPublicKey' in this.session)) {
                throw new TonConnectError('Trying to send bridge request without session');
            }

            const id = (await this.connectionStorage.getNextRpcRequestId()).toString();
            await this.connectionStorage.increaseNextRpcRequestId();

            logDebug('Send http-bridge request:', { ...request, id });

            const encodedRequest = this.session!.sessionCrypto.encrypt(
                JSON.stringify({ ...request, id }),
                hexToByteArray(this.session.walletPublicKey)
            );

            try {
                await this.gateway.send(
                    encodedRequest,
                    this.session.walletPublicKey,
                    request.method
                );
                onRequestSent?.();
                this.pendingRequests.set(id.toString(), resolve);
            } catch (e) {
                reject(e);
            }
        });
    }

    public closeConnection(): void {
        this.closeGateways();
        this.listeners = [];
        this.session = null;
        this.gateway = null;
    }

    public async disconnect(): Promise<void> {
        return new Promise(async resolve => {
            let called = false;
            const onRequestSent = (): void => {
                called = true;
                this.removeBridgeAndSession().then(resolve);
            };

            try {
                await this.sendRequest({ method: 'disconnect', params: [] }, onRequestSent);
            } catch (e) {
                console.debug(e);

                if (!called) {
                    this.removeBridgeAndSession().then(resolve);
                }
            }
        });
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
        bridgeUrl: string,
        bridgeIncomingMessage: BridgeIncomingMessage
    ): Promise<void> {
        if (!this.pendingGateways.includes(gateway)) {
            gateway.close();
            return;
        }

        this.closeGateways({ except: gateway });

        this.session!.bridgeUrl = bridgeUrl;
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

        logDebug('Wallet message received:', walletMessage);

        if (!('event' in walletMessage)) {
            const id = walletMessage.id.toString();
            const resolve = this.pendingRequests.get(id);
            if (!resolve) {
                logDebug(`Response id ${id} doesn't match any request's id`);
                return;
            }

            resolve(walletMessage);
            this.pendingRequests.delete(id);
            return;
        }

        if (walletMessage.id !== undefined) {
            const lastId = await this.connectionStorage.getLastWalletEventId();

            if (lastId !== undefined && walletMessage.id <= lastId) {
                logError(
                    `Received event id (=${walletMessage.id}) must be greater than stored last wallet event id (=${lastId}) `
                );
                return;
            }

            if (walletMessage.event !== 'connect') {
                await this.connectionStorage.storeLastWalletEventId(walletMessage.id);
            }
        }

        // `this.listeners` might be modified in the event handler
        const listeners = this.listeners;

        if (walletMessage.event === 'connect') {
            await this.updateSession(walletMessage, bridgeIncomingMessage.from);
        }

        if (walletMessage.event === 'disconnect') {
            await this.removeBridgeAndSession();
        }

        listeners.forEach(listener => listener(walletMessage));
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
            lastWalletEventId: connectEvent.id,
            connectEvent: connectEventToSave,
            nextRpcRequestId: 0
        });
    }

    private async removeBridgeAndSession(): Promise<void> {
        this.closeConnection();
        await this.connectionStorage.removeConnection();
    }

    private generateUniversalLink(universalLink: string, message: ConnectRequest): string {
        if (isTelegramUrl(universalLink)) {
            return this.generateTGUniversalLink(universalLink, message);
        }

        return this.generateRegularUniversalLink(universalLink, message);
    }

    private generateRegularUniversalLink(universalLink: string, message: ConnectRequest): string {
        const url = new URL(universalLink);
        url.searchParams.append('v', PROTOCOL_VERSION.toString());
        url.searchParams.append('id', this.session!.sessionCrypto.sessionId);
        url.searchParams.append('r', JSON.stringify(message));
        return url.toString();
    }

    private generateTGUniversalLink(universalLink: string, message: ConnectRequest): string {
        const urlToWrap = this.generateRegularUniversalLink('about:blank', message);
        const linkParams = urlToWrap.split('?')[1]!;

        const startapp = 'tonconnect-' + encodeTelegramUrlParameters(linkParams);

        // TODO: Remove this line after all dApps and the wallets-list.json have been updated
        const updatedUniversalLink = this.convertToDirectLink(universalLink);

        const url = new URL(updatedUniversalLink);
        url.searchParams.append('startapp', startapp);
        return url.toString();
    }

    // TODO: Remove this method after all dApps and the wallets-list.json have been updated
    private convertToDirectLink(universalLink: string): string {
        const url = new URL(universalLink);

        if (url.searchParams.has('attach')) {
            url.searchParams.delete('attach');
            url.pathname += '/start';
        }

        return url.toString();
    }

    private async openGateways(sessionCrypto: SessionCrypto, options?: { openingDeadlineMS?: number }): Promise<void> {
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
                    this.pendingGatewaysListener(gateway, source.bridgeUrl, message)
                );

                return gateway;
            });

            await Promise.allSettled(this.pendingGateways.map(bridge => bridge.registerSession(options)));
            return;
        } else {
            this.gateway = new BridgeGateway(
                this.storage,
                this.walletConnectionSource.bridgeUrl,
                sessionCrypto.sessionId,
                this.gatewayListener.bind(this),
                this.gatewayErrorsListener.bind(this)
            );
            return this.gateway.registerSession(options);
        }
    }

    private closeGateways(options?: { except: BridgeGateway }): void {
        this.gateway?.close();
        this.pendingGateways
            .filter(item => item !== options?.except)
            .forEach(bridge => bridge.close());
        this.pendingGateways = [];
    }
}

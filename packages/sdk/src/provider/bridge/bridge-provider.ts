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
    ConnectEventSuccess
} from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors/ton-connect.error';
import { WalletConnectionSource } from 'src/models';
import { BridgeGateway } from 'src/provider/bridge/bridge-gateway';
import { BridgeIncomingMessage } from 'src/provider/bridge/models/bridge-incomming-message';
import { BridgePartialSession, BridgeSession } from 'src/provider/bridge/models/bridge-session';
import { HTTPProvider } from 'src/provider/provider';
import { BridgeConnectionStorage } from 'src/storage/bridge-connection-storage';
import { IStorage } from 'src/storage/models/storage.interface';
import { WithoutId } from 'src/utils/types';
import * as protocol from 'src/resources/protocol.json';

export class BridgeProvider implements HTTPProvider {
    public readonly type = 'http';

    private readonly connectionStorage: BridgeConnectionStorage;

    private readonly pendingRequests = new Map<
        string,
        (response: WithoutId<WalletResponse<RpcMethod>>) => void
    >();

    private nextRequestId = 0;

    private session: BridgeSession | BridgePartialSession | null = null;

    private bridge: BridgeGateway | null = null;

    private listeners: Array<(e: WalletEvent) => void> = [];

    constructor(
        storage: IStorage,
        private readonly walletConnectionSource: WalletConnectionSource
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
            this.walletConnectionSource.bridgeUrl,
            sessionCrypto.sessionId,
            this.gatewayListener.bind(this),
            this.gatewayErrorsListener.bind(this)
        );
        this.bridge.registerSession();

        return this.generateUniversalLink(message);
    }

    public async autoConnect(): Promise<void> {
        this.bridge?.close();
        const storedConnection = await this.connectionStorage.getConnection();
        if (!storedConnection) {
            return;
        }

        this.session = storedConnection.session;

        this.bridge = new BridgeGateway(
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
                JSON.stringify(request),
                hexToByteArray(this.session.walletPublicKey)
            );

            this.bridge.send(encodedRequest, this.session.walletPublicKey).catch(reject);
            this.pendingRequests.set(id.toString(), resolve);
        });
    }

    public closeConnection(): void {
        this.bridge?.close();
        this.listeners = [];
    }

    public disconnect(): Promise<void> {
        this.bridge?.close();
        this.listeners = [];
        return this.removeBridgeAndSession();
    }

    public listen(callback: (e: WalletEvent) => void): () => void {
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
            const resolve = this.pendingRequests.get(walletMessage.id);
            if (!resolve) {
                throw new TonConnectError(
                    `Response id ${walletMessage.id} doesn't match any request's id`
                );
            }

            resolve(walletMessage);
            this.pendingRequests.delete(walletMessage.id);
            return;
        }

        if (walletMessage.event === 'connect') {
            await this.updateSession(walletMessage, bridgeIncomingMessage.from);
        }

        this.listeners.forEach(listener => listener(walletMessage));
    }

    private async gatewayErrorsListener(e: Event): Promise<void> {
        throw new TonConnectError(`Bridge error ${e}`);
    }

    private async updateSession(
        connectEvent: ConnectEventSuccess,
        walletPublicKey: string
    ): Promise<void> {
        this.session = {
            ...this.session!,
            walletPublicKey
        };
        await this.connectionStorage.storeConnection({ session: this.session, connectEvent });
    }

    private async removeBridgeAndSession(): Promise<void> {
        this.session = null;
        this.bridge = null;
        await this.connectionStorage.removeConnection();
    }

    private generateUniversalLink(message: ConnectRequest): string {
        const url = new URL(this.walletConnectionSource.universalLinkBase);
        url.searchParams.append('v', protocol.version.toString());
        url.searchParams.append('id', this.session!.sessionCrypto.sessionId);
        url.searchParams.append('r', Base64.encode(JSON.stringify(message), true));
        return url.toString();
    }
}

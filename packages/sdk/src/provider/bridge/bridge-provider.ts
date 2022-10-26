import { Base64 } from 'js-base64';
import {
    SessionCrypto,
    AppRequest,
    ConnectRequest,
    RpcMethod,
    WalletEvent,
    WalletResponse,
    WalletMessage,
    hexToByteArray
} from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors/ton-connect.error';
import { DappSettings, WalletConnectionSource } from 'src/models';
import { BridgeGateway } from 'src/provider/bridge/bridge-gateway';
import { BridgeIncomingMessage } from 'src/provider/bridge/models/bridge-incomming-message';
import { BridgePartialSession, BridgeSession } from 'src/provider/bridge/models/bridge-session';
import { HTTPProvider } from 'src/provider/provider';
import { BridgeSessionStorage } from 'src/storage/bridge-session-storage';
import { base64ToBytes } from 'src/utils/binary';
import { WithoutId } from 'src/utils/types';

export class BridgeProvider implements HTTPProvider {
    public readonly type = 'http';

    private readonly sessionStorage: BridgeSessionStorage;

    private readonly pendingRequests = new Map<
        string,
        (response: WithoutId<WalletResponse<RpcMethod>>) => void
    >();

    private nextRequestId = 0;

    private session: BridgeSession | BridgePartialSession | null = null;

    private bridge: BridgeGateway | null = null;

    private listeners: Array<(e: WalletEvent) => void> = [];

    constructor(
        private readonly dappSettings: DappSettings,
        private readonly walletConnectionSource: WalletConnectionSource
    ) {
        this.sessionStorage = new BridgeSessionStorage(this.dappSettings.storage);
    }

    public connect(message: ConnectRequest): string {
        this.bridge?.close();
        const sessionCrypto = new SessionCrypto();

        this.session = {
            sessionCrypto,
            bridgeUrl: this.walletConnectionSource.bridgeUrl
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
                base64ToBytes(bridgeIncomingMessage.message),
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
            await this.updateBridgeAndSession(bridgeIncomingMessage.from);
        }

        this.listeners.forEach(listener => listener(walletMessage));
    }

    private async gatewayErrorsListener(e: Event): Promise<void> {
        throw new TonConnectError(`Bridge error ${e}`);
    }

    private async updateBridgeAndSession(walletPublicKey: string): Promise<void> {
        this.session = {
            ...this.session!,
            walletPublicKey
        };
        await this.sessionStorage.storeSession(this.session);
    }

    private async removeBridgeAndSession(): Promise<void> {
        this.session = null;
        this.bridge = null;
        await this.sessionStorage.removeSession();
    }

    private generateUniversalLink(message: ConnectRequest): string {
        const url = new URL(this.walletConnectionSource.universalLinkBase);
        url.searchParams.append('v', this.dappSettings.protocolVersion.toString());
        url.searchParams.append('id', this.session!.sessionCrypto.sessionId);
        url.searchParams.append('r', Base64.encode(JSON.stringify(message), true));
        return url.toString();
    }
}

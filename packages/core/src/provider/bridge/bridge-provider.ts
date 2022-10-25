import { Base64 } from 'js-base64';
import { SessionKeypair } from 'src/crypto/session-crypto';
import { TonConnectError } from 'src/errors/ton-connect.error';
import {
    AppRequest,
    ConnectRequest,
    DappSettings,
    RpcMethod,
    WalletConnectionSource,
    WalletEvent,
    WalletResponse
} from 'src/models';
import { WalletMessage } from 'src/models/protocol/wallet-message/wallet-message';
import { BridgeGateway } from 'src/provider/bridge/bridge-gateway';
import { BridgeIncomingMessage } from 'src/provider/bridge/models/bridge-incomming-message';
import { BridgePartialSession, BridgeSession } from 'src/provider/bridge/models/bridge-session';
import { HTTPProvider } from 'src/provider/provider';
import { BridgeSessionStorage } from 'src/storage/bridge-session-storage';
import { base64ToBytes, hexToByteArray } from 'src/utils/binary';
import { WithoutId } from 'src/utils/types';

export class BridgeProvider implements HTTPProvider {
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

    public async connect(message: ConnectRequest): Promise<string> {
        //    const session = this.sessionStorage.getSession();
        this.bridge?.close();
        const sessionKeyPair = new SessionKeypair();

        this.session = {
            sessionKeyPair,
            bridgeUrl: this.walletConnectionSource.bridgeUrl
        };

        this.bridge = new BridgeGateway(
            this.walletConnectionSource.bridgeUrl,
            sessionKeyPair.sessionId,
            this.gatewayListener.bind(this),
            this.gatewayErrorsListener.bind(this)
        );
        await this.bridge.registerSession();

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

            const encodedRequest = this.session!.sessionKeyPair.encrypt(
                JSON.stringify(request),
                hexToByteArray(this.session.walletPublicKey)
            );

            this.bridge.send(encodedRequest, this.session.walletPublicKey).catch(reject);
            this.pendingRequests.set(id.toString(), resolve);
        });
    }

    public disconnect(): Promise<void> {
        this.bridge?.close();
        return this.removeBridgeAndSession();
    }

    public listen(callback: (e: WalletEvent) => void): () => void {
        this.listeners.push(callback);
        return () => (this.listeners = this.listeners.filter(listener => listener !== callback));
    }

    private async gatewayListener(bridgeIncomingMessage: BridgeIncomingMessage): Promise<void> {
        const walletMessage: WalletMessage = JSON.parse(
            this.session!.sessionKeyPair.decrypt(
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
        url.searchParams.append('id', this.session!.sessionKeyPair.sessionId);
        url.searchParams.append('r', Base64.encode(JSON.stringify(message), true));
        return url.toString();
    }
}

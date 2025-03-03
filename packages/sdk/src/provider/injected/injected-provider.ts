import { WalletNotInjectedError } from 'src/errors/wallet/wallet-not-injected.error';
import {
    AppRequest,
    ConnectEventError,
    ConnectRequest,
    Feature,
    RpcMethod,
    WalletEvent,
    WalletResponse
} from '@tonconnect/protocol';
import {
    InjectedWalletApi,
    isJSBridgeWithMetadata
} from 'src/provider/injected/models/injected-wallet-api';
import { InternalProvider } from 'src/provider/provider';
import { BridgeConnectionStorage } from 'src/storage/bridge-connection-storage';
import { IStorage } from 'src/storage/models/storage.interface';
import { WithoutId, WithoutIdDistributive } from 'src/utils/types';
import { getWindow, tryGetWindowKeys } from 'src/utils/web-api';
import { PROTOCOL_VERSION } from 'src/resources/protocol';
import { WalletInfoCurrentlyInjected } from 'src/models';
import { logDebug } from 'src/utils/log';

type WindowWithTon<T extends string> = {
    [key in T]: {
        tonconnect: InjectedWalletApi;
    };
} & Window;

export class InjectedProvider<T extends string = string> implements InternalProvider {
    private static window = getWindow();

    public static async fromStorage(storage: IStorage): Promise<InjectedProvider> {
        const bridgeConnectionStorage = new BridgeConnectionStorage(storage);
        const connection = await bridgeConnectionStorage.getInjectedConnection();
        return new InjectedProvider(storage, connection.jsBridgeKey);
    }

    public static isWalletInjected(injectedWalletKey: string): boolean {
        return InjectedProvider.isWindowContainsWallet(this.window, injectedWalletKey);
    }

    public static isInsideWalletBrowser(injectedWalletKey: string): boolean {
        if (InjectedProvider.isWindowContainsWallet(this.window, injectedWalletKey)) {
            return this.window[injectedWalletKey]!.tonconnect.isWalletBrowser;
        }

        return false;
    }

    public static getCurrentlyInjectedWallets(
        checkRequiredFeatures: (features: Feature[] | undefined) => boolean
    ): WalletInfoCurrentlyInjected[] {
        if (!this.window) {
            return [];
        }

        const windowKeys = tryGetWindowKeys();
        const wallets = windowKeys.filter(([_, value]) =>
            isJSBridgeWithMetadata(value)
        ) as unknown as [string, { tonconnect: InjectedWalletApi }][];

        return wallets.map(([jsBridgeKey, wallet]) => ({
            name: wallet.tonconnect.walletInfo.name,
            appName: wallet.tonconnect.walletInfo.app_name,
            aboutUrl: wallet.tonconnect.walletInfo.about_url,
            imageUrl: wallet.tonconnect.walletInfo.image,
            tondns: wallet.tonconnect.walletInfo.tondns,
            jsBridgeKey,
            injected: true,
            embedded: wallet.tonconnect.isWalletBrowser,
            platforms: wallet.tonconnect.walletInfo.platforms,
            features: wallet.tonconnect.walletInfo.features,
            isSupportRequiredFeatures: checkRequiredFeatures(
                wallet.tonconnect.walletInfo.features
            ),
        }));
    }

    private static isWindowContainsWallet<T extends string>(
        window: Window | undefined,
        injectedWalletKey: string
    ): window is WindowWithTon<T> {
        return (
            !!window &&
            injectedWalletKey in window &&
            typeof window[injectedWalletKey as keyof Window] === 'object' &&
            'tonconnect' in window[injectedWalletKey as keyof Window]
        );
    }

    public readonly type = 'injected';

    private unsubscribeCallback: (() => void) | null = null;

    private injectedWallet: InjectedWalletApi;

    private readonly connectionStorage: BridgeConnectionStorage;

    private listenSubscriptions = false;

    private listeners: Array<(e: WithoutIdDistributive<WalletEvent>) => void> = [];

    constructor(storage: IStorage, private readonly injectedWalletKey: T) {
        const window: Window | undefined | WindowWithTon<T> = InjectedProvider.window;
        if (!InjectedProvider.isWindowContainsWallet(window, injectedWalletKey)) {
            throw new WalletNotInjectedError();
        }

        this.connectionStorage = new BridgeConnectionStorage(storage);
        this.injectedWallet = window[injectedWalletKey]!.tonconnect!;
    }

    public connect(message: ConnectRequest): void {
        this._connect(PROTOCOL_VERSION, message);
    }

    public async restoreConnection(): Promise<void> {
        try {
            logDebug(`Injected Provider restoring connection...`);
            const connectEvent = await this.injectedWallet.restoreConnection();
            logDebug('Injected Provider restoring connection response', connectEvent);

            if (connectEvent.event === 'connect') {
                this.makeSubscriptions();
                this.listeners.forEach(listener => listener(connectEvent));
            } else {
                await this.connectionStorage.removeConnection();
            }
        } catch (e) {
            await this.connectionStorage.removeConnection();
            console.error(e);
        }
    }

    public closeConnection(): void {
        if (this.listenSubscriptions) {
            this.injectedWallet.disconnect();
        }
        this.closeAllListeners();
    }

    public async disconnect(): Promise<void> {
        return new Promise(resolve => {
            const onRequestSent = (): void => {
                this.closeAllListeners();
                this.connectionStorage.removeConnection().then(resolve);
            };

            try {
                this.injectedWallet.disconnect();
                onRequestSent();
            } catch (e) {
                logDebug(e);

                this.sendRequest(
                    {
                        method: 'disconnect',
                        params: []
                    },
                    onRequestSent
                );
            }
        });
    }

    private closeAllListeners(): void {
        this.listenSubscriptions = false;
        this.listeners = [];
        this.unsubscribeCallback?.();
    }

    public listen(eventsCallback: (e: WithoutIdDistributive<WalletEvent>) => void): () => void {
        this.listeners.push(eventsCallback);
        return () =>
            (this.listeners = this.listeners.filter(listener => listener !== eventsCallback));
    }

    public sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>,
        options?: {
            onRequestSent?: () => void;
            signal?: AbortSignal;
            attempts?: number;
        }
    ): Promise<WithoutId<WalletResponse<T>>>;
    /** @deprecated use sendRequest(transaction, options) instead */
    public sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>,
        onRequestSent?: () => void
    ): Promise<WithoutId<WalletResponse<T>>>;
    public async sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>,
        optionsOrOnRequestSent?:
            | (() => void)
            | { onRequestSent?: () => void; signal?: AbortSignal; attempts?: number }
    ): Promise<WithoutId<WalletResponse<T>>> {
        // TODO: remove deprecated method
        const options: {
            onRequestSent?: () => void;
            signal?: AbortSignal;
            attempts?: number;
        } = {};
        if (typeof optionsOrOnRequestSent === 'function') {
            options.onRequestSent = optionsOrOnRequestSent;
        } else {
            options.onRequestSent = optionsOrOnRequestSent?.onRequestSent;
            options.signal = optionsOrOnRequestSent?.signal;
        }

        const id = (await this.connectionStorage.getNextRpcRequestId()).toString();
        await this.connectionStorage.increaseNextRpcRequestId();

        logDebug('Send injected-bridge request:', { ...request, id });
        const result = this.injectedWallet.send<T>({ ...request, id } as AppRequest<T>);
        result.then(response => logDebug('Wallet message received:', response));
        options?.onRequestSent?.();

        return result;
    }

    private async _connect(protocolVersion: number, message: ConnectRequest): Promise<void> {
        try {
            logDebug(
                `Injected Provider connect request: protocolVersion: ${protocolVersion}, message:`,
                message
            );
            const connectEvent = await this.injectedWallet.connect(protocolVersion, message);

            logDebug('Injected Provider connect response:', connectEvent);

            if (connectEvent.event === 'connect') {
                await this.updateSession();
                this.makeSubscriptions();
            }
            this.listeners.forEach(listener => listener(connectEvent));
        } catch (e) {
            logDebug('Injected Provider connect error:', e);
            const connectEventError: WithoutId<ConnectEventError> = {
                event: 'connect_error',
                payload: {
                    code: 0,
                    message: e?.toString()
                }
            };

            this.listeners.forEach(listener => listener(connectEventError));
        }
    }

    private makeSubscriptions(): void {
        this.listenSubscriptions = true;
        this.unsubscribeCallback = this.injectedWallet.listen(e => {
            logDebug('Wallet message received:', e);

            if (this.listenSubscriptions) {
                this.listeners.forEach(listener => listener(e));
            }

            if (e.event === 'disconnect') {
                this.disconnect();
            }
        });
    }

    private updateSession(): Promise<void> {
        return this.connectionStorage.storeConnection({
            type: 'injected',
            jsBridgeKey: this.injectedWalletKey,
            nextRpcRequestId: 0
        });
    }
}

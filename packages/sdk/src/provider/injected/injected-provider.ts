import { WalletNotInjectedError } from 'src/errors/wallet/wallet-not-injected.error';
import {
    AppRequest,
    RpcMethod,
    WalletResponse,
    ConnectRequest,
    WalletEvent,
    ConnectEvent
} from '@tonconnect/protocol';
import { InjectedWalletApi } from 'src/provider/injected/models/injected-wallet-api';
import { InternalProvider } from 'src/provider/provider';
import { BridgeConnectionStorage } from 'src/storage/bridge-connection-storage';
import { IStorage } from 'src/storage/models/storage.interface';
import { WithoutId } from 'src/utils/types';
import { getWindow } from 'src/utils/web-api';
import { PROTOCOL_VERSION } from 'src/resources/protocol';

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

    private listeners: Array<(e: WalletEvent) => void> = [];

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
            const connectEvent = await this.injectedWallet.restoreConnection();
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

    public disconnect(): Promise<void> {
        this.closeAllListeners();
        this.injectedWallet.disconnect();
        return this.connectionStorage.removeConnection();
    }

    private closeAllListeners(): void {
        this.listenSubscriptions = false;
        this.listeners = [];
        this.unsubscribeCallback?.();
    }

    public listen(eventsCallback: (e: WalletEvent) => void): () => void {
        this.listeners.push(eventsCallback);
        return () =>
            (this.listeners = this.listeners.filter(listener => listener !== eventsCallback));
    }

    public async sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>
    ): Promise<WithoutId<WalletResponse<T>>> {
        return this.injectedWallet.send<T>({ ...request, id: '0' });
    }

    private async _connect(protocolVersion: number, message: ConnectRequest): Promise<void> {
        try {
            const connectEvent = await this.injectedWallet.connect(protocolVersion, message);

            if (connectEvent.event === 'connect') {
                await this.updateSession();
                this.makeSubscriptions();
            }
            this.listeners.forEach(listener => listener(connectEvent));
        } catch (e) {
            console.debug(e);
            const connectEventError: ConnectEvent = {
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
            jsBridgeKey: this.injectedWalletKey
        });
    }
}

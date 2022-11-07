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
import * as protocol from 'src/resources/protocol.json';
import { BridgeConnectionStorage } from 'src/storage/bridge-connection-storage';
import { IStorage } from 'src/storage/models/storage.interface';
import { WithoutId } from 'src/utils/types';

type WindowWithTon<T extends string> = {
    [key in T]: {
        tonconnect: InjectedWalletApi;
    };
} & Window;

export class InjectedProvider<T extends string = string> implements InternalProvider {
    private static window = window;

    public static async fromStorage(storage: IStorage): Promise<InjectedProvider> {
        const bridgeConnectionStorage = new BridgeConnectionStorage(storage);
        const connection = await bridgeConnectionStorage.getInjectedConnection();
        return new InjectedProvider(connection.jsBridgeKey);
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
        window: Window,
        injectedWalletKey: string
    ): window is WindowWithTon<T> {
        return (
            window &&
            injectedWalletKey in window &&
            typeof window[injectedWalletKey as keyof Window] === 'object' &&
            'tonconnect' in window[injectedWalletKey as keyof Window]
        );
    }

    public readonly type = 'injected';

    private unsubscribeCallback: (() => void) | null = null;

    private injectedWallet: InjectedWalletApi;

    private listenSubscriptions = false;

    private listeners: Array<(e: WalletEvent) => void> = [];

    constructor(injectedWalletKey: T) {
        const window: Window | WindowWithTon<T> = InjectedProvider.window;
        if (!InjectedProvider.isWindowContainsWallet(window, injectedWalletKey)) {
            throw new WalletNotInjectedError();
        }

        this.injectedWallet = window[injectedWalletKey]!.tonconnect!;
    }

    public connect(message: ConnectRequest, auto = false): void {
        this.injectedWallet
            .connect(protocol.version, message, auto)
            .then(connectEvent => {
                if (connectEvent.event === 'connect') {
                    this.makeSubscriptions();
                    this.listenSubscriptions = true;
                }
                this.listeners.forEach(listener => listener(connectEvent));
            })
            .catch(e => {
                const connectEventError: ConnectEvent = {
                    event: 'connect_error',
                    payload: {
                        code: 0,
                        message: e?.toString()
                    }
                };

                this.listeners.forEach(listener => listener(connectEventError));
            });
    }

    public async restoreConnection(): Promise<void> {
        try {
            const connectEvent = await this.injectedWallet.restoreConnection();
            if (connectEvent.event === 'connect') {
                this.makeSubscriptions();
                this.listenSubscriptions = true;
                this.listeners.forEach(listener => listener(connectEvent));
            }
        } catch (e) {
            console.error(e);
        }
    }

    public closeConnection(): void {
        this.listenSubscriptions = false;
        this.listeners = [];
        this.unsubscribeCallback?.();
    }

    public disconnect(): Promise<void> {
        this.listenSubscriptions = false;
        this.listeners = [];
        this.unsubscribeCallback?.();
        return Promise.resolve();
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

    private makeSubscriptions(): void {
        this.unsubscribeCallback = this.injectedWallet.listen(e => {
            if (this.listenSubscriptions) {
                this.listeners.forEach(listener => listener(e));
            }

            if (e.event === 'disconnect') {
                this.disconnect();
            }
        });
    }
}

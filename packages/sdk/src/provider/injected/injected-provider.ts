import { WalletNotInjectedError } from 'src/errors/wallet/wallet-not-injected.error';
import {
    AppRequest,
    RpcMethod,
    WalletResponse,
    DeviceInfo,
    ConnectRequest,
    WalletEvent,
    ConnectEvent
} from '@tonconnect/protocol';
import { InjectedWalletApi } from 'src/provider/injected/models/injected-wallet-api';
import { InternalProvider } from 'src/provider/provider';
import * as protocol from 'src/resources/protocol.json';
import { WithoutId } from 'src/utils/types';

interface WindowWithTon extends Window {
    tonconnect?: InjectedWalletApi;
}

export class InjectedProvider implements InternalProvider {
    private static window = window as WindowWithTon;

    static isWalletInjected(): boolean {
        return (
            this.window && 'tonconnect' in this.window && typeof this.window.tonconnect === 'object'
        );
    }

    static deviceInfo(): DeviceInfo | undefined {
        return InjectedProvider.isWalletInjected()
            ? InjectedProvider.window.tonconnect!.deviceInfo
            : undefined;
    }

    public readonly type = 'injected';

    private unsubscribeCallback: (() => void) | null = null;

    private injectedWallet: InjectedWalletApi;

    private listenSubscriptions = false;

    private listeners: Array<(e: WalletEvent) => void> = [];

    constructor() {
        if (!InjectedProvider.isWalletInjected()) {
            throw new WalletNotInjectedError();
        }

        this.injectedWallet = InjectedProvider.window.tonconnect!;
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

    public async autoConnect(): Promise<void> {
        try {
            const connectEvent = await this.injectedWallet.autoConnect();
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

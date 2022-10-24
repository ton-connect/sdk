import { WalletNotInjectedError } from 'src/errors/wallet/wallet-not-injected.error';
import { AppRequest, RpcMethod, WalletResponse, DeviceInfo, ConnectRequest } from 'src/models';
import { InjectedWalletApi } from 'src/provider/injected/models/injected-wallet-api';
import { ProviderError } from 'src/provider/models/provider-error';
import { ProviderEvent } from 'src/provider/models/provider-event';
import { InternalProvider } from 'src/provider/provider';
import { IStorage } from 'src/storage/models/storage.interface';
import * as protocol from 'src/resources/protocol.json';

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

    private injectedWallet: InjectedWalletApi;

    private listenSubscriptions = false;

    private listeners: {
        eventsCallback: (e: ProviderEvent) => void;
        errorsCallback?: (e: ProviderError) => void;
    }[] = [];

    constructor(private readonly storage: IStorage) {
        if (!InjectedProvider.isWalletInjected()) {
            throw new WalletNotInjectedError();
        }

        this.injectedWallet = InjectedProvider.window.tonconnect!;
        this.makeSubscriptions();
    }

    public connect(message: ConnectRequest, auto = false): Promise<void> {
        this.injectedWallet
            .connect(protocol.version, message, auto)
            .then(walletInfo => {
                this.listenSubscriptions = true;
                const connectionEvent: ProviderEvent = {
                    name: 'connect',
                    value: walletInfo
                };

                this.listeners.forEach(listener => listener.eventsCallback(connectionEvent));
            })
            .catch(e => {
                const providerError: ProviderError = {
                    name: 'connectionError',
                    value: e
                };

                this.listeners.forEach(listener => listener.errorsCallback?.(providerError));
            });

        return Promise.resolve();
    }

    public disconnect(): Promise<void> {
        this.listenSubscriptions = false;
        this.injectedWallet.disconnect();
        return Promise.resolve();
    }

    public listen(
        eventsCallback: (e: ProviderEvent) => void,
        errorsCallback?: (e: ProviderError) => void
    ): void {
        this.listeners.push({ eventsCallback, errorsCallback });
    }

    public async sendRequest<T extends RpcMethod>(
        request: AppRequest<T>
    ): Promise<WalletResponse<T>> {
        return this.injectedWallet.send(request);
    }

    private makeSubscriptions(): void {
        this.injectedWallet.listen.onAccountChange(
            account =>
                this.listenSubscriptions &&
                this.listeners.forEach(listener =>
                    listener.eventsCallback({ name: 'accountChange', value: { account } })
                )
        );

        this.injectedWallet.listen.onDisconnect(() => {
            if (this.listenSubscriptions) {
                this.listeners.forEach(listener =>
                    listener.eventsCallback({ name: 'disconnect', value: {} })
                );
            }
            this.listenSubscriptions = false;
        });
    }
}

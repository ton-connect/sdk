import { WalletNotInjectedError } from 'src/errors/ton-connect/wallet/wallet-not-injected.error';
import { ActionRequest } from 'src/ton-connect/core/models/protocol/action-request';
import { WalletAppInfo } from 'src/ton-connect/core/models/wallet/wallet-app-info';
import { InjectedWalletApi } from 'src/ton-connect/core/provider/injected/models/injected-wallet-api';
import { ProviderError } from 'src/ton-connect/core/provider/models/provider-error';
import { ProviderEvent } from 'src/ton-connect/core/provider/models/provider-event';
import { ProviderRequest } from 'src/ton-connect/core/provider/models/provider-request';
import { ProviderResponse } from 'src/ton-connect/core/provider/models/provider-response';
import { InternalProvider } from 'src/ton-connect/core/provider/provider';

interface WindowWithTon extends Window {
    ton?: InjectedWalletApi;
}

export class InjectedProvider implements InternalProvider {
    private static window = window as WindowWithTon;

    static isWalletInjected(): boolean {
        return this.window && 'ton' in this.window && typeof this.window.ton === 'object';
    }

    static injectedWalletAppInfo(): WalletAppInfo | undefined {
        return InjectedProvider.isWalletInjected()
            ? InjectedProvider.window.ton!.getWalletAppInfo()
            : undefined;
    }

    private injectedWallet: InjectedWalletApi;

    private listenSubscriptions = false;

    private listeners: {
        eventsCallback: (e: ProviderEvent) => void;
        errorsCallback?: (e: ProviderError) => void;
    }[] = [];

    constructor() {
        if (!InjectedProvider.isWalletInjected()) {
            throw new WalletNotInjectedError();
        }

        this.injectedWallet = InjectedProvider.window.ton!;
        this.makeSubscriptions();
    }

    public connect(): Promise<void> {
        this.injectedWallet
            .connect()
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

    public async sendRequest(request: ProviderRequest): Promise<ProviderResponse> {
        const actionRequest = request as ActionRequest;
        const response = await this.injectedWallet.sendRequest(actionRequest);
        return response as ProviderResponse;
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

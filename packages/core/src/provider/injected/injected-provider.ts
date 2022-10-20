import { WalletNotInjectedError } from 'src/errors/wallet/wallet-not-injected.error';
import { WalletAppInfo } from 'src/models';
import { ActionRequest, RequestType } from 'src/models/protocol/actions/action-request';
import { ActionResponse } from 'src/models/protocol/actions/action-response';
import { InjectedWalletApi } from 'src/provider/injected/models/injected-wallet-api';
import { ProviderError } from 'src/provider/models/provider-error';
import { ProviderEvent } from 'src/provider/models/provider-event';
import { InternalProvider } from 'src/provider/provider';

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

    public async sendRequest<T extends RequestType>(
        request: ActionRequest<T>
    ): Promise<ActionResponse<T>> {
        return this.injectedWallet.sendRequest(request);
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

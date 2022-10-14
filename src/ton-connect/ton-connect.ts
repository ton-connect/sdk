import { WalletAlreadyConnectedError } from 'src/errors/ton-connect/wallet/wallet-already-connected.error';
import { WalletNotConnectedError } from 'src/errors/ton-connect/wallet/wallet-not-connected.error';
import { DappMetadata } from 'src/ton-connect/core';
import { ErrorsParser } from 'src/ton-connect/core/errors-parser';
import { Connection } from 'src/ton-connect/core/models/connection';
import { DappSettings } from 'src/ton-connect/core/models/dapp/dapp-settings';
import { SendTransactionRequest } from 'src/ton-connect/core/models/protocol/actions/send-transaction/send-transaction-request';
import { SendTransactionResponse } from 'src/ton-connect/core/models/protocol/actions/send-transaction/send-transaction-response';
import { SignMessageRequest } from 'src/ton-connect/core/models/protocol/actions/sign-message/sign-message-request';
import { SignMessageResponse } from 'src/ton-connect/core/models/protocol/actions/sign-message/sign-message-response';
import { WalletConnectionSource } from 'src/ton-connect/core/models/wallet/wallet-connection-source';
import { WalletAppInfo } from 'src/ton-connect/core/models/wallet/wallet-app-info';
import { BridgeProvider } from 'src/ton-connect/core/provider/bridge/bridge-provider';
import { InjectedProvider } from 'src/ton-connect/core/provider/injected/injected-provider';
import { ProviderError } from 'src/ton-connect/core/provider/models/provider-error';
import { ProviderEvent } from 'src/ton-connect/core/provider/models/provider-event';
import { Account } from 'src/ton-connect/core/models/wallet/account';
import { Provider } from 'src/ton-connect/core/provider/provider';
import { WalletInfo } from 'src/ton-connect/core/models/wallet/wallet-info';
import { DefaultStorage } from 'src/ton-connect/core/storage/default-storage';
import { IStorage } from 'src/ton-connect/core/storage/models/storage.interface';
import { WalletInfoStorage } from 'src/ton-connect/core/storage/wallet-info-storage';
import { getWalletConnectionSource } from 'src/ton-connect/resources/wallets/utils';
import { ITonConnect } from 'src/ton-connect/ton-connect.interface';
import { getWebPageMetadata } from 'src/ton-connect/utils/web-api';
import * as protocol from 'src/ton-connect/resources/protocol.json';

export class TonConnect implements ITonConnect {
    private readonly dappSettings: DappSettings;

    private readonly walletInfoStorage: WalletInfoStorage;

    private connection: Connection | null = null;

    private statusChangeSubscriptions: ((walletInfo: WalletInfo | null) => void)[] = [];

    public get connected(): boolean {
        return this.connection !== null;
    }

    public get account(): Account | null {
        return this.walletInfo?.account || null;
    }

    public get walletAppInfo(): WalletAppInfo | null {
        return this.walletInfo?.appInfo || null;
    }

    private get provider(): Provider | null {
        return this.connection?.provider || null;
    }

    private get walletInfo(): WalletInfo | null {
        return this.connection?.walletInfo || null;
    }

    constructor(options?: { dappMetedata?: DappMetadata; storage?: IStorage }) {
        this.dappSettings = {
            metadata: options?.dappMetedata || getWebPageMetadata(),
            storage: options?.storage || new DefaultStorage(),
            protocolVersion: protocol.version
        };

        this.walletInfoStorage = new WalletInfoStorage(this.dappSettings.storage);
    }

    public onStatusChange(callback: (walletInfo: WalletInfo | null) => void): () => void {
        this.statusChangeSubscriptions.push(callback);
        return () =>
            (this.statusChangeSubscriptions = this.statusChangeSubscriptions.filter(
                item => item !== callback
            ));
    }

    public async connect<T extends WalletConnectionSource | 'injected'>(
        wallet: T
    ): Promise<T extends 'injected' ? void : string>;
    public async connect(wallet: WalletConnectionSource | 'injected'): Promise<string | void> {
        if (this.connected) {
            throw new WalletAlreadyConnectedError();
        }

        const provider = await this.createProvider(wallet);
        return provider.connect();
    }

    public async autoConnect(): Promise<void> {
        const walletInfo = await this.walletInfoStorage.loadWalletInfo();
        if (walletInfo && !this.connected) {
            const wallet =
                walletInfo.provider === 'injected'
                    ? 'injected'
                    : getWalletConnectionSource(walletInfo.appInfo.id);

            const provider = await this.createProvider(wallet);
            await provider.connect();

            this.onProviderConnected(provider, walletInfo);
        }
    }

    public async sendTransaction(tx: SendTransactionRequest): Promise<SendTransactionResponse> {
        this.checkConnection();
        const response = await this.provider!.sendRequest<'send-transaction'>(tx);

        if (response.status === 'error') {
            ErrorsParser.parseAndThrowError(response.result);
        }

        return response.result;
    }

    public async sign(signRequest: SignMessageRequest): Promise<SignMessageResponse> {
        this.checkConnection();
        const response = await this.provider!.sendRequest<'sign-message'>(signRequest);

        if (response.status === 'error') {
            ErrorsParser.parseAndThrowError(response.result);
        }

        return response.result;
    }

    public async disconnect(): Promise<void> {
        if (!this.connected) {
            throw new WalletNotConnectedError();
        }
        await this.provider!.disconnect();
        this.onProviderDisconnected();
    }

    private async createProvider(wallet: WalletConnectionSource | 'injected'): Promise<Provider> {
        let provider: Provider;

        if (wallet === 'injected') {
            provider = new InjectedProvider();
        } else {
            provider = new BridgeProvider(this.dappSettings, wallet);
        }

        provider.listen(
            e => this.providerEventsListener(provider, e),
            e => this.providerErrorsListener(provider, e)
        );
        return provider;
    }

    private providerEventsListener(provider: Provider, e: ProviderEvent): void {
        switch (e.name) {
            case 'connect':
                this.onProviderConnected(provider, e.value);
                break;
            case 'accountChange':
                this.onProviderAccountChange(e.value.account);
                break;
            case 'disconnect':
                this.onProviderDisconnected();
        }
    }

    private providerErrorsListener(provider: Provider, e: ProviderError): void {
        console.error(`Provider ${provider} error:`, e);
    }

    private onProviderConnected(provider: Provider, walletInfo: WalletInfo): void {
        this.connection = { provider, walletInfo };

        this.statusChangeSubscriptions.forEach(callback => callback(walletInfo));
    }

    private onProviderDisconnected(): void {
        this.connection = null;
        this.statusChangeSubscriptions.forEach(callback => callback(null));
    }

    private onProviderAccountChange(account: Account): void {
        const walletInfo = { ...this.connection!.walletInfo, account };
        this.connection!.walletInfo = walletInfo;
        this.statusChangeSubscriptions.forEach(callback => callback(walletInfo));
    }

    private checkConnection(): void | never {
        if (!this.connected) {
            throw new WalletNotConnectedError();
        }
    }
}

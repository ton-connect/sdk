import { ErrorsParser } from 'src/errors/errors-parser';
import { WalletAlreadyConnectedError } from 'src/errors/wallet/wallet-already-connected.error';
import { WalletNotConnectedError } from 'src/errors/wallet/wallet-not-connected.error';
import {
    Account,
    DappMetadata,
    DappSettings,
    DeviceInfo,
    SendTransactionRequest,
    SendTransactionResponse,
    WalletConnectionSource,
    WalletInfo
} from 'src/models';
import { Connection } from 'src/models/connection';
import { BridgeProvider } from 'src/provider/bridge/bridge-provider';
import { InjectedProvider } from 'src/provider/injected/injected-provider';
import { ProviderError } from 'src/provider/models/provider-error';
import { ProviderEvent } from 'src/provider/models/provider-event';
import { Provider } from 'src/provider/provider';
import * as protocol from 'src/resources/protocol.json';
import { getWalletConnectionSource } from 'src/resources/wallets/utils';
import { DefaultStorage } from 'src/storage/default-storage';
import { IStorage } from 'src/storage/models/storage.interface';
import { WalletInfoStorage } from 'src/storage/wallet-info-storage';
import { ITonConnect } from 'src/ton-connect.interface';
import { getWebPageMetadata } from 'src/utils/web-api';

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

    public get walletAppInfo(): DeviceInfo | null {
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

    // public async sign(signRequest: SignMessageRequest): Promise<SignMessageResponse> { }

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

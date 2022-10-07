import { WalletAlreadyConnectedError } from 'src/errors/ton-connect/wallet/wallet-already-connected.error';
import { WalletNotConnectedError } from 'src/errors/ton-connect/wallet/wallet-not-connected.error';
import { DappMetadata, SignRequest, TransactionRequest } from 'src/ton-connect/core';
import { DappSettings } from 'src/ton-connect/core/models/dapp/dapp-settings';
import { WalletConnectionSource } from 'src/ton-connect/core/models/wallet-connection-source';
import { WalletAppInfo } from 'src/ton-connect/core/models/wallet/wallet-app-info';
import { BridgeProvider } from 'src/ton-connect/core/provider/bridge/bridge-provider';
import { InjectedProvider } from 'src/ton-connect/core/provider/injected/injected-provider';
import { ProviderError } from 'src/ton-connect/core/provider/models/provider-error';
import { ProviderEvent } from 'src/ton-connect/core/provider/models/provider-event';
import { Account } from 'src/ton-connect/core/models/account';
import { Provider } from 'src/ton-connect/core/provider/provider';
import { WalletInfo } from 'src/ton-connect/core/models/wallet-info';
import { DefaultStorage } from 'src/ton-connect/core/storage/default-storage';
import { IStorage } from 'src/ton-connect/core/storage/models/storage.interface';
import { WalletInfoStorage } from 'src/ton-connect/core/storage/wallet-info-storage';
import { getWalletConnectionSource } from 'src/ton-connect/resources/wallets/utils';
import { getWebPageMetadata } from 'src/ton-connect/utils/web-api';
import * as protocol from 'src/ton-connect/resources/protocol.json';

export class TonConnect {
    private readonly dappSettings: DappSettings;

    private readonly walletInfoStorage: WalletInfoStorage;

    private provider: Provider | null = null;

    private walletInfo: WalletInfo | null = null;

    private connectSubscriptions: ((walletInfo: WalletInfo) => void)[] = [];

    private accountChangeSubscriptions: ((account: Account) => void)[] = [];

    private disconnectSubscriptions: (() => void)[] = [];

    public get connected(): boolean {
        return this.provider !== null;
    }

    public get account(): Account | null {
        return this.walletInfo?.account || null;
    }

    public get walletAppInfo(): WalletAppInfo | null {
        return this.walletInfo?.appInfo || null;
    }

    constructor(options?: { dappMetedata?: DappMetadata; storage?: IStorage }) {
        this.dappSettings = {
            metadata: options?.dappMetedata || getWebPageMetadata(),
            storage: options?.storage || new DefaultStorage(),
            protocolVersion: protocol.version
        };

        this.walletInfoStorage = new WalletInfoStorage(this.dappSettings.storage);
    }

    public onConnect(callback: (walletInfo: WalletInfo) => void): void {
        this.connectSubscriptions.push(callback);
    }

    public onAccountChange(callback: (account: Account) => void): void {
        this.accountChangeSubscriptions.push(callback);
    }

    public onDisconnect(callback: () => void): void {
        this.disconnectSubscriptions.push(callback);
    }

    public onConnectedChange(callback: (isConnected: boolean) => void): void {
        this.connectSubscriptions.push(() => callback(true));
        this.disconnectSubscriptions.push(() => callback(false));
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

    public async sendTransaction(tx: TransactionRequest): Promise<boolean> {
        return Promise.resolve(Boolean(tx));
    }

    public async sign(signRequest: SignRequest): Promise<string> {
        return Promise.resolve(signRequest.message);
    }

    public async disconnect(): Promise<void> {
        if (!this.connected) {
            throw new WalletNotConnectedError();
        }
        await this.provider!.disconnect();
        this.onProviderDisconnected();
    }

    public async createProvider(wallet: WalletConnectionSource | 'injected'): Promise<Provider> {
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
        this.provider = provider;
        this.walletInfo = walletInfo;

        this.connectSubscriptions.forEach(callback => callback(walletInfo));
        this.accountChangeSubscriptions.forEach(callback => callback(walletInfo.account));
    }

    private onProviderDisconnected(): void {
        this.provider = null;
        this.walletInfo = null;
        this.disconnectSubscriptions.forEach(callback => callback());
    }

    private onProviderAccountChange(account: Account): void {
        this.accountChangeSubscriptions.forEach(callback => callback(account));
        this.disconnectSubscriptions.forEach(callback => callback());
    }
}

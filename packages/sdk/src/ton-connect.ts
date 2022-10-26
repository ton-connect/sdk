import {
    ConnectEventError,
    ConnectEventSuccess,
    ConnectRequest,
    SendTransactionRpcResponseSuccess,
    TonAddressItemReply,
    WalletEvent,
    CHAIN
} from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors/ton-connect.error';
import { WalletAlreadyConnectedError } from 'src/errors/wallet/wallet-already-connected.error';
import { WalletNotConnectedError } from 'src/errors/wallet/wallet-not-connected.error';
import { Account, DappMetadata, DappSettings, Wallet, WalletConnectionSource } from 'src/models';
import { SendTransactionRequest, SendTransactionResponse } from 'src/models/methods';
import { connectErrorsParser } from 'src/parsers/connect-errors-parser';
import { sendTransactionParser } from 'src/parsers/send-transaction-parser';
import { BridgeProvider } from 'src/provider/bridge/bridge-provider';
import { InjectedProvider } from 'src/provider/injected/injected-provider';
import { Provider } from 'src/provider/provider';
import * as protocol from 'src/resources/protocol.json';
import { DefaultStorage } from 'src/storage/default-storage';
import { IStorage } from 'src/storage/models/storage.interface';
import { WalletInfoStorage } from 'src/storage/wallet-info-storage';
import { ITonConnect } from 'src/ton-connect.interface';
import { mergeOptions } from 'src/utils/options';
import { getWebPageMetadata } from 'src/utils/web-api';

export class TonConnect implements ITonConnect {
    private readonly dappSettings: DappSettings;

    private readonly walletInfoStorage: WalletInfoStorage;

    private _wallet: Wallet | null = null;

    private provider: Provider | null = null;

    private statusChangeSubscriptions: ((walletInfo: Wallet | null) => void)[] = [];

    private statusChangeErrorSubscriptions: ((err: TonConnectError) => void)[] = [];

    public get connected(): boolean {
        return this._wallet !== null;
    }

    public get account(): Account | null {
        return this._wallet?.account || null;
    }

    public get wallet(): Wallet | null {
        return this._wallet;
    }

    private set wallet(value: Wallet | null) {
        this._wallet = value;
        this.statusChangeSubscriptions.forEach(callback => callback(this._wallet));
    }

    constructor(options?: { dappMetedata?: DappMetadata; storage?: IStorage }) {
        this.dappSettings = {
            metadata: options?.dappMetedata || getWebPageMetadata(),
            storage: options?.storage || new DefaultStorage(),
            protocolVersion: protocol.version
        };

        this.walletInfoStorage = new WalletInfoStorage(this.dappSettings.storage);
    }

    public onStatusChange(
        callback: (wallet: Wallet | null) => void,
        errorsHandler?: (err: TonConnectError) => void
    ): () => void {
        this.statusChangeSubscriptions.push(callback);
        if (errorsHandler) {
            this.statusChangeErrorSubscriptions.push(errorsHandler);
        }

        return () => {
            this.statusChangeSubscriptions = this.statusChangeSubscriptions.filter(
                item => item !== callback
            );
            if (errorsHandler) {
                this.statusChangeErrorSubscriptions = this.statusChangeErrorSubscriptions.filter(
                    item => item !== errorsHandler
                );
            }
        };
    }

    public connect<T extends WalletConnectionSource | 'injected'>(
        wallet: T
    ): T extends 'injected' ? void : string;
    public connect(wallet: WalletConnectionSource | 'injected'): string | void {
        if (this.connected) {
            throw new WalletAlreadyConnectedError();
        }

        this.provider?.closeConnection();
        this.provider = this.createProvider(wallet);

        return this.provider.connect(this.createConnectRequest());
    }

    public async autoConnect(): Promise<void> {
        /*const walletInfo = await this.walletInfoStorage.loadWalletInfo();
        if (walletInfo && !this.connected) {
            const wallet =
                walletInfo.provider === 'injected'
                    ? 'injected'
                    : getWalletConnectionSource(walletInfo.appInfo.id);

            const provider = await this.createProvider(wallet);
            await provider.connect();

            this.onProviderConnected(provider, walletInfo);
        } */
    }

    public async sendTransaction(tx: SendTransactionRequest): Promise<SendTransactionResponse> {
        this.checkConnection();
        const response = await this.provider!.sendRequest(
            sendTransactionParser.convertToRpcRequest(tx)
        );

        if (sendTransactionParser.isError(response)) {
            return sendTransactionParser.parseAndThrowError(response);
        }

        return sendTransactionParser.convertFromRpcResponse(
            response as SendTransactionRpcResponseSuccess
        );
    }

    public async disconnect(): Promise<void> {
        if (!this.connected) {
            throw new WalletNotConnectedError();
        }
        await this.provider!.disconnect();
        this.onWalletDisconnected();
    }

    private createProvider(wallet: WalletConnectionSource | 'injected'): Provider {
        let provider: Provider;

        if (wallet === 'injected') {
            provider = new InjectedProvider(this.dappSettings.storage);
        } else {
            provider = new BridgeProvider(this.dappSettings, wallet);
        }

        provider.listen(this.walletEventsListener.bind(this));
        return provider;
    }

    private walletEventsListener(e: WalletEvent): void {
        switch (e.event) {
            case 'connect':
                this.onWalletConnected(e.payload);
                break;
            case 'connect_error':
                this.onWalletConnectError(e.payload);
                break;
            case 'disconnect':
                this.onWalletDisconnected();
        }
    }

    private onWalletConnected(connectEvent: ConnectEventSuccess['payload']): void {
        const tonAccountItem: TonAddressItemReply | undefined = connectEvent.items.find(
            item => item.name === 'ton_addr'
        ) as TonAddressItemReply | undefined;
        if (!tonAccountItem) {
            throw new TonConnectError('ton_addr connection item was not found');
        }

        this.wallet = {
            device: connectEvent.device,
            provider: this.provider!.type,
            account: {
                address: tonAccountItem.address,
                chain: CHAIN.MAINNET // TODO
            }
        };
    }

    private onWalletConnectError(connectEventError: ConnectEventError['payload']): void {
        const error = connectErrorsParser.parseError(connectEventError);
        this.statusChangeErrorSubscriptions.forEach(errorsHandler => errorsHandler(error));
    }

    private onWalletDisconnected(): void {
        this.wallet = null;
    }

    private checkConnection(): void | never {
        if (!this.connected) {
            throw new WalletNotConnectedError();
        }
    }

    private createConnectRequest(): ConnectRequest {
        const webPageMetadata = getWebPageMetadata();
        const metadata = mergeOptions(this.dappSettings.metadata, webPageMetadata);

        return {
            ...metadata,
            items: [
                {
                    name: 'ton_addr'
                }
            ]
        };
    }
}

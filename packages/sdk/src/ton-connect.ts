import {
    ConnectEventError,
    ConnectEventSuccess,
    ConnectRequest,
    SendTransactionRpcResponseSuccess,
    TonAddressItemReply,
    WalletEvent,
    TonProofItemReply,
    ConnectItem
} from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors/ton-connect.error';
import { WalletAlreadyConnectedError } from 'src/errors/wallet/wallet-already-connected.error';
import { WalletNotConnectedError } from 'src/errors/wallet/wallet-not-connected.error';
import { Account, DappMetadata, DappSettings, Wallet, WalletConnectionSource } from 'src/models';
import { SendTransactionRequest, SendTransactionResponse } from 'src/models/methods';
import { ConnectAdditionalRequest } from 'src/models/methods/connect/connect-additional-request';
import { connectErrorsParser } from 'src/parsers/connect-errors-parser';
import { sendTransactionParser } from 'src/parsers/send-transaction-parser';
import { BridgeProvider } from 'src/provider/bridge/bridge-provider';
import { InjectedProvider } from 'src/provider/injected/injected-provider';
import { Provider } from 'src/provider/provider';
import { BridgeConnectionStorage } from 'src/storage/bridge-connection-storage';
import { DefaultStorage } from 'src/storage/default-storage';
import { IStorage } from 'src/storage/models/storage.interface';
import { ITonConnect } from 'src/ton-connect.interface';
import { mergeOptions } from 'src/utils/options';
import { getWebPageMetadata } from 'src/utils/web-api';

export class TonConnect implements ITonConnect {
    private readonly dappSettings: DappSettings;

    private readonly bridgeConnectionStorage: BridgeConnectionStorage;

    private _wallet: Wallet | null = null;

    private provider: Provider | null = null;

    private statusChangeSubscriptions: ((walletInfo: Wallet | null) => void)[] = [];

    private statusChangeErrorSubscriptions: ((err: TonConnectError) => void)[] = [];

    /**
     * Shows if the wallet is connected right now.
     */
    public get connected(): boolean {
        return this._wallet !== null;
    }

    /**
     * Current connected account or null if no account is connected.
     */
    public get account(): Account | null {
        return this._wallet?.account || null;
    }

    /**
     * Current connected wallet or null if no account is connected.
     */
    public get wallet(): Wallet | null {
        return this._wallet;
    }

    private set wallet(value: Wallet | null) {
        this._wallet = value;
        this.statusChangeSubscriptions.forEach(callback => callback(this._wallet));
    }

    constructor(options?: { dappMetedata?: Partial<DappMetadata>; storage?: IStorage }) {
        this.dappSettings = {
            metadata: mergeOptions(options?.dappMetedata, getWebPageMetadata()),
            storage: options?.storage || new DefaultStorage()
        };

        this.bridgeConnectionStorage = new BridgeConnectionStorage(this.dappSettings.storage);
    }

    /**
     * Indicates if the injected wallet is available.
     */
    public isInjectedProviderAvailable = InjectedProvider.isWalletInjected;

    /**
     * Allows to subscribe to connection status changes and handle connection errors.
     * @param callback will be called after connections status changes with actual wallet or null.
     * @param errorsHandler (optional) will be called with some instance of TonConnectError when connect error is received.
     * @returns unsubscribe callback.
     */
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

    /**
     * Generates universal link for an external wallet and subscribes to the wallet's bridge, or sends connect request to the injected wallet.
     * @param wallet wallet's bridge url and universal link for an external wallet or 'injected' for the injected wallet.
     * @param request (optional) additional request to pass to the wallet while connect (currently only ton_proof is available).
     * @returns universal link if external wallet was passed or void for the injected wallet.
     */
    public connect<T extends WalletConnectionSource | 'injected'>(
        wallet: T,
        request?: ConnectAdditionalRequest
    ): T extends 'injected' ? void : string;
    public connect(
        wallet: WalletConnectionSource | 'injected',
        request?: ConnectAdditionalRequest
    ): string | void {
        if (this.connected) {
            throw new WalletAlreadyConnectedError();
        }

        this.provider?.closeConnection();
        this.provider = this.createProvider(wallet);

        return this.provider.connect(this.createConnectRequest(request));
    }

    /**
     * Try to restore existing session and reconnect to the corresponding wallet. Call it immediately when your app is loaded.
     */
    public autoConnect(): void {
        this._autoConnect();
    }

    /**
     * Asks connected wallet to sign and send the transaction.
     * @param transaction transaction to send.
     * @returns signed transaction boc that allows you to find the transaction in the blockchain.
     * If user rejects transaction, method will throw the corresponding error.
     */
    public async sendTransaction(
        transaction: SendTransactionRequest
    ): Promise<SendTransactionResponse> {
        this.checkConnection();
        const response = await this.provider!.sendRequest(
            sendTransactionParser.convertToRpcRequest(transaction)
        );

        if (sendTransactionParser.isError(response)) {
            return sendTransactionParser.parseAndThrowError(response);
        }

        return sendTransactionParser.convertFromRpcResponse(
            response as SendTransactionRpcResponseSuccess
        );
    }

    /**
     * Disconnect form thw connected wallet and drop current session.
     */
    public async disconnect(): Promise<void> {
        if (!this.connected) {
            throw new WalletNotConnectedError();
        }
        await this.provider!.disconnect();
        this.onWalletDisconnected();
    }

    private async _autoConnect(): Promise<void> {
        const bridgeConnection = await this.bridgeConnectionStorage.getConnection();

        if (bridgeConnection) {
            this.provider = await this.createProvider(
                bridgeConnection.session.walletConnectionSource
            );
            return this.provider.autoConnect();
        }

        if (InjectedProvider.isWalletInjected()) {
            this.provider = await this.createProvider('injected');
            return this.provider.autoConnect();
        }
    }

    private createProvider(wallet: WalletConnectionSource | 'injected'): Provider {
        let provider: Provider;

        if (wallet === 'injected') {
            provider = new InjectedProvider();
        } else {
            provider = new BridgeProvider(this.dappSettings.storage, wallet);
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

        const tonProofItem: TonProofItemReply | undefined = connectEvent.items.find(
            item => item.name === 'ton_proof'
        ) as TonProofItemReply | undefined;

        if (!tonAccountItem) {
            throw new TonConnectError('ton_addr connection item was not found');
        }

        const wallet: Wallet = {
            device: connectEvent.device,
            provider: this.provider!.type,
            account: {
                address: tonAccountItem.address,
                chain: tonAccountItem.network
            }
        };

        if (tonProofItem) {
            wallet.connectItems = {
                tonProof: tonProofItem.signature
            };
        }

        this.wallet = wallet;
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

    private createConnectRequest(request?: ConnectAdditionalRequest): ConnectRequest {
        const webPageMetadata = getWebPageMetadata();
        const metadata = mergeOptions(this.dappSettings.metadata, webPageMetadata);

        const items: ConnectItem[] = [
            {
                name: 'ton_addr'
            }
        ];

        if (request) {
            items.push({
                name: 'ton_proof',
                payload: request.tonProof
            });
        }

        return {
            ...metadata,
            items
        };
    }
}

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
import { DappMetadataError } from 'src/errors/dapp/dapp-metadata.error';
import { ManifestContentErrorError } from 'src/errors/protocol/events/connect/manifest-content-error.error';
import { ManifestNotFoundError } from 'src/errors/protocol/events/connect/manifest-not-found.error';
import { TonConnectError } from 'src/errors/ton-connect.error';
import { WalletAlreadyConnectedError } from 'src/errors/wallet/wallet-already-connected.error';
import { WalletNotConnectedError } from 'src/errors/wallet/wallet-not-connected.error';
import {
    Account,
    Wallet,
    WalletConnectionSource,
    WalletConnectionSourceHTTP,
    WalletInfo
} from 'src/models';
import { SendTransactionRequest, SendTransactionResponse } from 'src/models/methods';
import { ConnectAdditionalRequest } from 'src/models/methods/connect/connect-additional-request';
import { TonConnectOptions } from 'src/models/ton-connect-options';
import {
    isWalletConnectionSourceJS,
    WalletConnectionSourceJS
} from 'src/models/wallet/wallet-connection-source';
import { connectErrorsParser } from 'src/parsers/connect-errors-parser';
import { sendTransactionParser } from 'src/parsers/send-transaction-parser';
import { BridgeProvider } from 'src/provider/bridge/bridge-provider';
import { InjectedProvider } from 'src/provider/injected/injected-provider';
import { Provider } from 'src/provider/provider';
import { BridgeConnectionStorage } from 'src/storage/bridge-connection-storage';
import { DefaultStorage } from 'src/storage/default-storage';
import { ITonConnect } from 'src/ton-connect.interface';
import { getDocument, getWebPageManifest } from 'src/utils/web-api';
import { WalletsListManager } from 'src/wallets-list-manager';
import { WithoutIdDistributive } from 'src/utils/types';
import { checkSendTransactionSupport } from 'src/utils/feature-support';

export class TonConnect implements ITonConnect {
    private static readonly walletsList = new WalletsListManager();

    /**
     * Check if specified wallet is injected and available to use with the app.
     * @param walletJSKey target wallet's js bridge key.
     */
    public static isWalletInjected = (walletJSKey: string): boolean =>
        InjectedProvider.isWalletInjected(walletJSKey);

    /**
     * Check if the app is opened inside specified wallet's browser.
     * @param walletJSKey target wallet's js bridge key.
     */
    public static isInsideWalletBrowser = (walletJSKey: string): boolean =>
        InjectedProvider.isInsideWalletBrowser(walletJSKey);

    /**
     * Returns available wallets list.
     */
    public static getWallets(): Promise<WalletInfo[]> {
        return this.walletsList.getWallets();
    }

    private readonly walletsList = new WalletsListManager();

    private readonly dappSettings: Pick<Required<TonConnectOptions>, 'manifestUrl' | 'storage'>;

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

    constructor(options?: TonConnectOptions) {
        this.dappSettings = {
            manifestUrl: options?.manifestUrl || getWebPageManifest(),
            storage: options?.storage || new DefaultStorage()
        };

        this.walletsList = new WalletsListManager({
            walletsListSource: options?.walletsListSource,
            cacheTTLMs: options?.walletsListCacheTTLMs
        });

        if (!this.dappSettings.manifestUrl) {
            throw new DappMetadataError(
                'Dapp tonconnect-manifest.json must be specified if window.location.origin is undefined. See more https://github.com/ton-connect/docs/blob/main/requests-responses.md#app-manifest'
            );
        }

        this.bridgeConnectionStorage = new BridgeConnectionStorage(this.dappSettings.storage);

        if (!options?.disableAutoPauseConnection) {
            this.addWindowFocusAndBlurSubscriptions();
        }
    }

    /**
     * Returns available wallets list.
     */
    public getWallets(): Promise<WalletInfo[]> {
        return this.walletsList.getWallets();
    }

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
     * @param wallet wallet's bridge url and universal link for an external wallet or jsBridge key for the injected wallet.
     * @param request (optional) additional request to pass to the wallet while connect (currently only ton_proof is available).
     * @returns universal link if external wallet was passed or void for the injected wallet.
     */
    public connect<
        T extends WalletConnectionSource | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[]
    >(
        wallet: T,
        request?: ConnectAdditionalRequest
    ): T extends WalletConnectionSourceJS ? void : string;
    public connect(
        wallet: WalletConnectionSource | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[],
        request?: ConnectAdditionalRequest
    ): void | string {
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
    public async restoreConnection(): Promise<void> {
        const [bridgeConnectionType, embeddedWallet] = await Promise.all([
            this.bridgeConnectionStorage.storedConnectionType(),
            this.walletsList.getEmbeddedWallet()
        ]);

        try {
            switch (bridgeConnectionType) {
                case 'http':
                    this.provider = await BridgeProvider.fromStorage(this.dappSettings.storage);
                    break;
                case 'injected':
                    this.provider = await InjectedProvider.fromStorage(this.dappSettings.storage);
                    break;
                default:
                    if (embeddedWallet) {
                        this.provider = await this.createProvider(embeddedWallet);
                    } else {
                        return;
                    }
            }
        } catch {
            await this.bridgeConnectionStorage.removeConnection();
            this.provider = null;
            return;
        }

        this.provider.listen(this.walletEventsListener.bind(this));
        return this.provider.restoreConnection();
    }

    /**
     * Asks connected wallet to sign and send the transaction.
     * @param transaction transaction to send.
     * @param onRequestSent (optional) will be called after the transaction is sent to the wallet.
     * @returns signed transaction boc that allows you to find the transaction in the blockchain.
     * If user rejects transaction, method will throw the corresponding error.
     */
    public async sendTransaction(
        transaction: SendTransactionRequest,
        onRequestSent?: () => void
    ): Promise<SendTransactionResponse> {
        this.checkConnection();
        checkSendTransactionSupport(this.wallet!.device.features, {
            requiredMessagesNumber: transaction.messages.length
        });

        const { validUntil, ...tx } = transaction;
        const from = transaction.from || this.account!.address;
        const network = transaction.network || this.account!.chain;

        const response = await this.provider!.sendRequest(
            sendTransactionParser.convertToRpcRequest({
                ...tx,
                valid_until: validUntil,
                from,
                network
            }),
            onRequestSent
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

    /**
     * Pause bridge HTTP connection. Might be helpful, if you want to pause connections while browser tab is unfocused,
     * or if you use SDK with NodeJS and want to save server resources.
     */
    public pauseConnection(): void {
        if (this.provider?.type !== 'http') {
            return;
        }

        this.provider.pause();
    }

    /**
     * Unpause bridge HTTP connection if it is paused.
     */
    public unPauseConnection(): Promise<void> {
        if (this.provider?.type !== 'http') {
            return Promise.resolve();
        }

        return this.provider.unPause();
    }

    private addWindowFocusAndBlurSubscriptions(): void {
        const document = getDocument();
        if (!document) {
            return;
        }

        try {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pauseConnection();
                } else {
                    this.unPauseConnection();
                }
            });
        } catch (e) {
            console.error('Cannot subscribe to the document.visibilitychange: ', e);
        }
    }

    private createProvider(
        wallet: WalletConnectionSource | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[]
    ): Provider {
        let provider: Provider;

        if (!Array.isArray(wallet) && isWalletConnectionSourceJS(wallet)) {
            provider = new InjectedProvider(this.dappSettings.storage, wallet.jsBridgeKey);
        } else {
            provider = new BridgeProvider(this.dappSettings.storage, wallet);
        }

        provider.listen(this.walletEventsListener.bind(this));
        return provider;
    }

    private walletEventsListener(e: WithoutIdDistributive<WalletEvent>): void {
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
                chain: tonAccountItem.network,
                walletStateInit: tonAccountItem.walletStateInit,
                publicKey: tonAccountItem.publicKey
            }
        };

        if (tonProofItem) {
            wallet.connectItems = {
                tonProof: tonProofItem
            };
        }

        this.wallet = wallet;
    }

    private onWalletConnectError(connectEventError: ConnectEventError['payload']): void {
        const error = connectErrorsParser.parseError(connectEventError);
        this.statusChangeErrorSubscriptions.forEach(errorsHandler => errorsHandler(error));

        console.debug(error);

        if (error instanceof ManifestNotFoundError || error instanceof ManifestContentErrorError) {
            console.error(error);
            throw error;
        }
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
        const items: ConnectItem[] = [
            {
                name: 'ton_addr'
            }
        ];

        if (request?.tonProof) {
            items.push({
                name: 'ton_proof',
                payload: request.tonProof
            });
        }

        return {
            manifestUrl: this.dappSettings.manifestUrl,
            items
        };
    }
}

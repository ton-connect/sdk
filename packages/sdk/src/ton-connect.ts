import {
    ConnectEventSuccess,
    ConnectItem,
    ConnectRequest,
    Feature,
    SendTransactionRpcResponseSuccess,
    TonAddressItemReply,
    TonProofItemReply,
    WalletEvent
} from '@tonconnect/protocol';
import { DappMetadataError } from 'src/errors/dapp/dapp-metadata.error';
import { ManifestContentErrorError } from 'src/errors/protocol/events/connect/manifest-content-error.error';
import { ManifestNotFoundError } from 'src/errors/protocol/events/connect/manifest-not-found.error';
import { TonConnectError } from 'src/errors/ton-connect.error';
import {
    WalletAlreadyConnectedError,
    WalletNotConnectedError,
    WalletMissingRequiredFeaturesError
} from 'src/errors/wallet';
import {
    Account,
    RequireFeature,
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
import {
    checkSendTransactionSupport,
    checkRequiredWalletFeatures
} from 'src/utils/feature-support';
import { callForSuccess } from 'src/utils/call-for-success';
import { logDebug, logError } from 'src/utils/log';
import { createAbortController } from 'src/utils/create-abort-controller';
import { TonConnectTracker } from 'src/tracker/ton-connect-tracker';
import { tonConnectSdkVersion } from 'src/constants/version';

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

    /**
     * Emits user action event to the EventDispatcher. By default, it uses `window.dispatchEvent` for browser environment.
     * @private
     */
    private readonly tracker: TonConnectTracker;

    private readonly walletsList = new WalletsListManager();

    private readonly dappSettings: Pick<Required<TonConnectOptions>, 'manifestUrl' | 'storage'>;

    private readonly bridgeConnectionStorage: BridgeConnectionStorage;

    private _wallet: Wallet | null = null;

    private provider: Provider | null = null;

    private statusChangeSubscriptions: ((walletInfo: Wallet | null) => void)[] = [];

    private statusChangeErrorSubscriptions: ((err: TonConnectError) => void)[] = [];

    private readonly walletsRequiredFeatures:
        | RequireFeature[]
        | ((features: Feature[]) => boolean)
        | undefined;

    private abortController?: AbortController;

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

        this.walletsRequiredFeatures = options?.walletsRequiredFeatures;

        this.walletsList = new WalletsListManager({
            walletsListSource: options?.walletsListSource,
            cacheTTLMs: options?.walletsListCacheTTLMs,
            walletsRequiredFeatures: options?.walletsRequiredFeatures
        });

        this.tracker = new TonConnectTracker({
            eventDispatcher: options?.eventDispatcher,
            tonConnectSdkVersion: tonConnectSdkVersion
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
     * @param options (optional) openingDeadlineMS for the connection opening deadline and signal for the connection abort.
     * @returns universal link if external wallet was passed or void for the injected wallet.
     */

    public connect<
        T extends WalletConnectionSource | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[]
    >(
        wallet: T,
        options?: {
            request?: ConnectAdditionalRequest;
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        }
    ): T extends WalletConnectionSourceJS ? void : string;
    /** @deprecated use connect(wallet, options) instead */
    public connect<
        T extends WalletConnectionSource | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[]
    >(
        wallet: T,
        request?: ConnectAdditionalRequest,
        options?: {
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        }
    ): T extends WalletConnectionSourceJS ? void : string;
    public connect(
        wallet: WalletConnectionSource | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[],
        requestOrOptions?:
            | ConnectAdditionalRequest
            | {
                  request?: ConnectAdditionalRequest;
                  openingDeadlineMS?: number;
                  signal?: AbortSignal;
              }
    ): void | string {
        // TODO: remove deprecated method
        const options: {
            request?: ConnectAdditionalRequest;
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        } = {};
        if (typeof requestOrOptions === 'object' && 'tonProof' in requestOrOptions) {
            options.request = requestOrOptions;
        }
        if (
            typeof requestOrOptions === 'object' &&
            ('openingDeadlineMS' in requestOrOptions ||
                'signal' in requestOrOptions ||
                'request' in requestOrOptions)
        ) {
            options.request = requestOrOptions?.request;
            options.openingDeadlineMS = requestOrOptions?.openingDeadlineMS;
            options.signal = requestOrOptions?.signal;
        }

        if (this.connected) {
            throw new WalletAlreadyConnectedError();
        }

        const abortController = createAbortController(options?.signal);
        this.abortController?.abort();
        this.abortController = abortController;

        if (abortController.signal.aborted) {
            throw new TonConnectError('Connection was aborted');
        }

        this.provider?.closeConnection();
        this.provider = this.createProvider(wallet);

        abortController.signal.addEventListener('abort', () => {
            this.provider?.closeConnection();
            this.provider = null;
        });

        this.tracker.trackConnectionStarted();

        return this.provider.connect(this.createConnectRequest(options?.request), {
            openingDeadlineMS: options?.openingDeadlineMS,
            signal: abortController.signal
        });
    }

    /**
     * Try to restore existing session and reconnect to the corresponding wallet. Call it immediately when your app is loaded.
     */
    public async restoreConnection(options?: {
        openingDeadlineMS?: number;
        signal?: AbortSignal;
    }): Promise<void> {
        this.tracker.trackConnectionRestoringStarted();

        const abortController = createAbortController(options?.signal);
        this.abortController?.abort();
        this.abortController = abortController;

        if (abortController.signal.aborted) {
            this.tracker.trackConnectionRestoringError('Connection restoring was aborted');
            return;
        }

        // TODO: potentially race condition here
        const [bridgeConnectionType, embeddedWallet] = await Promise.all([
            this.bridgeConnectionStorage.storedConnectionType(),
            this.walletsList.getEmbeddedWallet()
        ]);

        if (abortController.signal.aborted) {
            this.tracker.trackConnectionRestoringError('Connection restoring was aborted');
            return;
        }

        let provider: Provider | null = null;
        try {
            switch (bridgeConnectionType) {
                case 'http':
                    provider = await BridgeProvider.fromStorage(this.dappSettings.storage);
                    break;
                case 'injected':
                    provider = await InjectedProvider.fromStorage(this.dappSettings.storage);
                    break;
                default:
                    if (embeddedWallet) {
                        provider = this.createProvider(embeddedWallet);
                    } else {
                        return;
                    }
            }
        } catch {
            this.tracker.trackConnectionRestoringError('Provider is not restored');
            await this.bridgeConnectionStorage.removeConnection();
            provider?.closeConnection();
            provider = null;
            return;
        }

        if (abortController.signal.aborted) {
            provider?.closeConnection();
            this.tracker.trackConnectionRestoringError('Connection restoring was aborted');
            return;
        }

        if (!provider) {
            logError('Provider is not restored');
            this.tracker.trackConnectionRestoringError('Provider is not restored');
            return;
        }

        this.provider?.closeConnection();
        this.provider = provider;
        provider.listen(this.walletEventsListener.bind(this));

        const onAbortRestore = (): void => {
            this.tracker.trackConnectionRestoringError('Connection restoring was aborted');
            provider?.closeConnection();
            provider = null;
        };
        abortController.signal.addEventListener('abort', onAbortRestore);

        const restoreConnectionTask = callForSuccess(
            async _options => {
                await provider?.restoreConnection({
                    openingDeadlineMS: options?.openingDeadlineMS,
                    signal: _options.signal
                });

                abortController.signal.removeEventListener('abort', onAbortRestore);
                if (this.connected) {
                    this.tracker.trackConnectionRestoringCompleted(this.wallet);
                } else {
                    this.tracker.trackConnectionRestoringError('Connection restoring failed');
                }
            },
            {
                attempts: Number.MAX_SAFE_INTEGER,
                delayMs: 2_000,
                signal: options?.signal
            }
        );
        const restoreConnectionTimeout = new Promise<void>(
            resolve => setTimeout(() => resolve(), 12_000) // connection deadline
        );
        return Promise.race([restoreConnectionTask, restoreConnectionTimeout]);
    }

    /**
     * Asks connected wallet to sign and send the transaction.
     * @param transaction transaction to send.
     * @param options (optional) onRequestSent will be called after the request was sent to the wallet and signal for the transaction abort.
     * @returns signed transaction boc that allows you to find the transaction in the blockchain.
     * If user rejects transaction, method will throw the corresponding error.
     */
    public sendTransaction(
        transaction: SendTransactionRequest,
        options?: {
            onRequestSent?: () => void;
            signal?: AbortSignal;
        }
    ): Promise<SendTransactionResponse>;
    /** @deprecated use sendTransaction(transaction, options) instead */
    public sendTransaction(
        transaction: SendTransactionRequest,
        onRequestSent?: () => void
    ): Promise<SendTransactionResponse>;
    public async sendTransaction(
        transaction: SendTransactionRequest,
        optionsOrOnRequestSent?:
            | {
                  onRequestSent?: () => void;
                  signal?: AbortSignal;
              }
            | (() => void)
    ): Promise<SendTransactionResponse> {
        // TODO: remove deprecated method
        const options: {
            onRequestSent?: () => void;
            signal?: AbortSignal;
        } = {};
        if (typeof optionsOrOnRequestSent === 'function') {
            options.onRequestSent = optionsOrOnRequestSent;
        } else {
            options.onRequestSent = optionsOrOnRequestSent?.onRequestSent;
            options.signal = optionsOrOnRequestSent?.signal;
        }

        const abortController = createAbortController(options?.signal);
        if (abortController.signal.aborted) {
            throw new TonConnectError('Transaction sending was aborted');
        }

        this.checkConnection();

        const requiredMessagesNumber = transaction.messages.length;
        const requireExtraCurrencies = transaction.messages.some(
            m => m.extraCurrency && Object.keys(m.extraCurrency).length > 0
        );
        checkSendTransactionSupport(this.wallet!.device.features, {
            requiredMessagesNumber,
            requireExtraCurrencies
        });

        this.tracker.trackTransactionSentForSignature(this.wallet, transaction);

        const { validUntil, messages, ...tx } = transaction;
        const from = transaction.from || this.account!.address;
        const network = transaction.network || this.account!.chain;

        const response = await this.provider!.sendRequest(
            sendTransactionParser.convertToRpcRequest({
                ...tx,
                from,
                network,
                valid_until: validUntil,
                messages: messages.map(({ extraCurrency, ...msg }) => ({
                    ...msg,
                    extra_currency: extraCurrency
                }))
            }),
            { onRequestSent: options.onRequestSent, signal: abortController.signal }
        );

        if (sendTransactionParser.isError(response)) {
            this.tracker.trackTransactionSigningFailed(
                this.wallet,
                transaction,
                response.error.message,
                response.error.code
            );
            return sendTransactionParser.parseAndThrowError(response);
        }

        const result = sendTransactionParser.convertFromRpcResponse(
            response as SendTransactionRpcResponseSuccess
        );
        this.tracker.trackTransactionSigned(this.wallet, transaction, result);
        return result;
    }

    /**
     * Disconnect form thw connected wallet and drop current session.
     */
    public async disconnect(options?: { signal?: AbortSignal }): Promise<void> {
        if (!this.connected) {
            throw new WalletNotConnectedError();
        }
        const abortController = createAbortController(options?.signal);
        const prevAbortController = this.abortController;
        this.abortController = abortController;

        if (abortController.signal.aborted) {
            throw new TonConnectError('Disconnect was aborted');
        }

        this.onWalletDisconnected('dapp');
        await this.provider?.disconnect({
            signal: abortController.signal
        });
        prevAbortController?.abort();
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
                    this.unPauseConnection().catch();
                }
            });
        } catch (e) {
            logError('Cannot subscribe to the document.visibilitychange: ', e);
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
                this.tracker.trackConnectionError(e.payload.message, e.payload.code);
                const walletError = connectErrorsParser.parseError(e.payload);
                this.onWalletConnectError(walletError);
                break;
            case 'disconnect':
                this.onWalletDisconnected('wallet');
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

        const hasRequiredFeatures = checkRequiredWalletFeatures(
            connectEvent.device.features,
            this.walletsRequiredFeatures ?? []
        );

        if (!hasRequiredFeatures) {
            this.provider?.disconnect();
            this.onWalletConnectError(
                new WalletMissingRequiredFeaturesError(
                    'Wallet does not support required features',
                    { cause: { connectEvent } }
                )
            );
            return;
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

        this.tracker.trackConnectionCompleted(wallet);
    }

    private onWalletConnectError(error: TonConnectError): void {
        this.statusChangeErrorSubscriptions.forEach(errorsHandler => errorsHandler(error));

        logDebug(error);

        if (error instanceof ManifestNotFoundError || error instanceof ManifestContentErrorError) {
            logError(error);
            throw error;
        }
    }

    private onWalletDisconnected(scope: 'wallet' | 'dapp'): void {
        this.tracker.trackDisconnection(this.wallet, scope);
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

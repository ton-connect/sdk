import {
    ChainId,
    CONNECT_ITEM_ERROR_CODES,
    ConnectEventSuccess,
    ConnectItem,
    ConnectRequest,
    SendTransactionRpcResponseSuccess,
    SignDataPayload,
    SignDataRpcResponseSuccess,
    TonAddressItemReply,
    TonProofItemReply
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
    RequiredFeatures,
    Wallet,
    WalletConnectionSource,
    WalletConnectionSourceHTTP,
    WalletConnectionSourceJS,
    WalletConnectionSourceWalletConnect,
    WalletInfo
} from 'src/models';
import {
    SendTransactionRequest,
    SendTransactionResponse,
    SignDataResponse,
    SignMessageResponse
} from 'src/models/methods';
import type {
    SendTransactionIntentResponse,
    SignDataIntentResponse,
    SignMessageIntentResponse,
    SendActionIntentResponse
} from 'src/models/methods/intents';
import {
    SendTransactionIntentRequest,
    SignDataIntentRequest,
    SignMessageIntentRequest,
    SendActionIntentRequest,
    IntentUrlOptions
} from 'src/models/methods/intents';
import { ConnectAdditionalRequest } from 'src/models/methods/connect/connect-additional-request';
import { AnalyticsSettings, TonConnectOptions } from 'src/models/ton-connect-options';
import {
    isWalletConnectionSourceJS,
    isWalletConnectionSourceWalletConnect
} from 'src/models/wallet/wallet-connection-source';
import { isWalletInfoRemote } from 'src/models/wallet/wallet-info';
import { connectErrorsParser } from 'src/parsers/connect-errors-parser';
import { sendTransactionParser } from 'src/parsers/send-transaction-parser';
import { signDataParser } from 'src/parsers/sign-data-parser';
import { BridgeProvider } from 'src/provider/bridge/bridge-provider';
import { InjectedProvider } from 'src/provider/injected/injected-provider';
import { Provider } from 'src/provider/provider';
import { BridgeConnectionStorage } from 'src/storage/bridge-connection-storage';
import { DefaultStorage } from 'src/storage/default-storage';
import { ITonConnect } from 'src/ton-connect.interface';
import { WalletWrongNetworkError } from 'src/errors/wallet/wallet-wrong-network.error';
import { getDocument, getOriginWithPath, getWebPageManifest } from 'src/utils/web-api';
import { WalletsListManager } from 'src/wallets-list-manager';
import { OptionalTraceable, Traceable } from 'src/utils/types';
import {
    checkSendTransactionSupport,
    checkRequiredWalletFeatures,
    checkSignDataSupport
} from 'src/utils/feature-support';
import { callForSuccess } from 'src/utils/call-for-success';
import { logDebug, logError } from 'src/utils/log';
import { createAbortController } from 'src/utils/create-abort-controller';
import { TonConnectTracker } from 'src/tracker/ton-connect-tracker';
import { tonConnectSdkVersion } from 'src/constants/version';
import {
    validateSendTransactionRequest,
    validateSignDataPayload,
    validateConnectAdditionalRequest,
    validateTonProofItemReply
} from './validation/schemas';
import { isQaModeEnabled } from './utils/qa-mode';
import { normalizeBase64 } from './utils/base64';
import { AnalyticsManager } from 'src/analytics/analytics-manager';
import { BrowserEventDispatcher } from 'src/tracker/browser-event-dispatcher';
import { EventDispatcher } from 'src/tracker/event-dispatcher';
import { SdkActionEvent } from 'src/tracker/types';
import { bindEventsTo } from 'src/analytics/sdk-actions-adapter';
import { BridgePartialSession, BridgeSession } from 'src/provider/bridge/models/bridge-session';
import { IEnvironment } from 'src/environment/models/environment.interface';
import { DefaultEnvironment } from 'src/environment/default-environment';
import { UUIDv7 } from 'src/utils/uuid';
import { TraceableWalletEvent, TraceableWalletResponse } from 'src/models/wallet/traceable-events';
import type { RpcMethod } from '@tonconnect/protocol';
import type { HTTPProvider } from 'src/provider/provider';
import { WalletConnectProvider } from 'src/provider/wallet-connect/wallet-connect-provider';
import {
    buildInlineIntentUrl,
    encodeConnectRequestForUrl,
    serializeSendActionIntent,
    serializeSendTransactionIntent,
    serializeSignDataIntent,
    serializeSignMessageIntent
} from 'src/intents/serializer';

const DEFAULT_OBJECT_STORAGE_URL = 'https://ton-connect-bridge-v3-staging.tapps.ninja/objects';
const MAX_INLINE_INTENT_URL_LENGTH = 1023;

function isFullConnectRequest(
    x: ConnectAdditionalRequest | ConnectRequest | undefined
): x is ConnectRequest {
    return (
        x !== undefined &&
        typeof x === 'object' &&
        'manifestUrl' in x &&
        'items' in x &&
        Array.isArray((x as ConnectRequest).items)
    );
}

function resolveIntentConnectRequest(
    options: OptionalTraceable<IntentUrlOptions> | undefined,
    createConnectRequest: (additional?: ConnectAdditionalRequest) => ConnectRequest
): ConnectRequest | undefined {
    if (options?.excludeConnect) {
        return undefined;
    }
    if (options?.connectRequest && isFullConnectRequest(options.connectRequest)) {
        return options.connectRequest;
    }
    const additional =
        options?.connectRequest && !isFullConnectRequest(options.connectRequest)
            ? options.connectRequest
            : undefined;
    return createConnectRequest(additional);
}

export class TonConnect implements ITonConnect {
    private desiredChainId: string | undefined;
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

    private intentResponseSubscriptions: Array<
        (response: { id: string; result?: unknown; error?: unknown; traceId: string }) => void
    > = [];

    public onIntentResponse(
        callback: (response: {
            id: string;
            result?: unknown;
            error?: unknown;
            traceId: string;
        }) => void
    ): () => void {
        this.intentResponseSubscriptions.push(callback);

        return () => {
            this.intentResponseSubscriptions = this.intentResponseSubscriptions.filter(
                existing => existing !== callback
            );
        };
    }

    private readonly walletsList = new WalletsListManager();

    private analytics?: AnalyticsManager;

    private readonly environment: IEnvironment;

    private readonly dappSettings: Pick<Required<TonConnectOptions>, 'manifestUrl' | 'storage'>;

    private readonly bridgeConnectionStorage: BridgeConnectionStorage;

    private _wallet: Wallet | null = null;

    private provider: Provider | null = null;

    private statusChangeSubscriptions: ((walletInfo: Wallet | null) => void)[] = [];

    private statusChangeErrorSubscriptions: ((err: TonConnectError) => void)[] = [];

    private readonly walletsRequiredFeatures: RequiredFeatures | undefined;

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
        const manifestUrl = options?.manifestUrl || getWebPageManifest();
        this.dappSettings = {
            manifestUrl,
            storage: options?.storage || new DefaultStorage()
        };

        this.walletsRequiredFeatures = options?.walletsRequiredFeatures;

        this.walletsList = new WalletsListManager({
            walletsListSource: options?.walletsListSource,
            cacheTTLMs: options?.walletsListCacheTTLMs
        });

        const eventDispatcher = options?.eventDispatcher ?? new BrowserEventDispatcher();
        this.tracker = new TonConnectTracker({
            eventDispatcher,
            tonConnectSdkVersion: tonConnectSdkVersion
        });

        this.environment = options?.environment ?? new DefaultEnvironment();

        this.initAnalytics(manifestUrl, eventDispatcher, options);

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
        options?: OptionalTraceable<{
            request?: ConnectAdditionalRequest;
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        }>
    ): T extends WalletConnectionSourceJS
        ? void
        : T extends WalletConnectionSourceWalletConnect
          ? void
          : string;
    /** @deprecated use connect(wallet, options) instead */
    public connect<
        T extends WalletConnectionSource | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[]
    >(
        wallet: T,
        request?: ConnectAdditionalRequest,
        options?: OptionalTraceable<{
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        }>
    ): T extends WalletConnectionSourceJS
        ? void
        : T extends WalletConnectionSourceWalletConnect
          ? void
          : string;
    // eslint-disable-next-line complexity
    public connect(
        wallet: WalletConnectionSource | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[],
        requestOrOptions?:
            | ConnectAdditionalRequest
            | OptionalTraceable<{
                  request?: ConnectAdditionalRequest;
                  openingDeadlineMS?: number;
                  signal?: AbortSignal;
              }>,
        additionalOptions?: OptionalTraceable<{
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        }>
    ): void | string {
        // TODO: remove deprecated method
        const options: OptionalTraceable<{
            request?: ConnectAdditionalRequest;
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        }> = {
            ...additionalOptions
        };

        if (
            typeof requestOrOptions === 'object' &&
            requestOrOptions !== null &&
            'tonProof' in requestOrOptions
        ) {
            options.request = requestOrOptions;
        }

        if (
            typeof requestOrOptions === 'object' &&
            requestOrOptions !== null &&
            ('openingDeadlineMS' in requestOrOptions ||
                'signal' in requestOrOptions ||
                'request' in requestOrOptions ||
                'traceId' in requestOrOptions)
        ) {
            options.request = requestOrOptions?.request;
            options.openingDeadlineMS = requestOrOptions?.openingDeadlineMS;
            options.signal = requestOrOptions?.signal;
        }

        if (options.request) {
            const validationError = validateConnectAdditionalRequest(options.request);
            if (validationError) {
                if (isQaModeEnabled()) {
                    console.error('ConnectAdditionalRequest validation failed: ' + validationError);
                } else {
                    throw new TonConnectError(
                        'ConnectAdditionalRequest validation failed: ' + validationError
                    );
                }
            }
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

        const traceId = options?.traceId ?? UUIDv7();
        this.tracker.trackConnectionStarted(traceId);

        return this.provider.connect(this.createConnectRequest(options?.request), {
            openingDeadlineMS: options?.openingDeadlineMS,
            signal: abortController.signal,
            traceId
        });
    }

    /**
     * Try to restore existing session and reconnect to the corresponding wallet. Call it immediately when your app is loaded.
     */
    public async restoreConnection(
        options?: OptionalTraceable<{
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        }>
    ): Promise<void> {
        const traceId = options?.traceId ?? UUIDv7();
        this.tracker.trackConnectionRestoringStarted(traceId);

        const abortController = createAbortController(options?.signal);
        this.abortController?.abort();
        this.abortController = abortController;

        if (abortController.signal.aborted) {
            this.tracker.trackConnectionRestoringError('Connection restoring was aborted', traceId);
            return;
        }

        // TODO: potentially race condition here
        const [bridgeConnectionType, embeddedWallet] = await Promise.all([
            this.bridgeConnectionStorage.storedConnectionType(),
            this.walletsList.getEmbeddedWallet()
        ]);

        if (abortController.signal.aborted) {
            this.tracker.trackConnectionRestoringError('Connection restoring was aborted', traceId);
            return;
        }

        let provider: Provider | null = null;
        try {
            switch (bridgeConnectionType) {
                case 'http':
                    provider = await BridgeProvider.fromStorage(
                        this.dappSettings.storage,
                        this.analytics
                    );
                    break;
                case 'injected':
                    provider = await InjectedProvider.fromStorage(
                        this.dappSettings.storage,
                        this.analytics
                    );
                    break;
                case 'wallet-connect':
                    provider = await WalletConnectProvider.fromStorage(this.dappSettings.storage);
                    break;
                default:
                    if (embeddedWallet) {
                        provider = this.createProvider(embeddedWallet);
                    } else {
                        return;
                    }
            }
        } catch (err) {
            logDebug('Provider is not restored', err);
            this.tracker.trackConnectionRestoringError('Provider is not restored', traceId);
            await this.bridgeConnectionStorage.removeConnection();
            provider?.closeConnection();
            provider = null;
            return;
        }

        if (abortController.signal.aborted) {
            provider?.closeConnection();
            this.tracker.trackConnectionRestoringError('Connection restoring was aborted', traceId);
            return;
        }

        if (!provider) {
            logError('Provider is not restored');
            this.tracker.trackConnectionRestoringError('Provider is not restored', traceId);
            return;
        }

        this.provider?.closeConnection();
        this.provider = provider;
        provider.listen(this.walletEventsListener.bind(this));

        const onAbortRestore = (): void => {
            this.tracker.trackConnectionRestoringError('Connection restoring was aborted', traceId);
            provider?.closeConnection();
            provider = null;
        };
        abortController.signal.addEventListener('abort', onAbortRestore);

        const restoreConnectionTask = callForSuccess(
            async _options => {
                await provider?.restoreConnection({
                    openingDeadlineMS: options?.openingDeadlineMS,
                    signal: _options.signal,
                    traceId
                });

                abortController.signal.removeEventListener('abort', onAbortRestore);
                if (this.connected) {
                    const sessionInfo = this.getSessionInfo();
                    this.tracker.trackConnectionRestoringCompleted(
                        this.wallet,
                        sessionInfo,
                        traceId
                    );
                } else {
                    this.tracker.trackConnectionRestoringError(
                        'Connection restoring failed',
                        traceId
                    );
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
        options?: OptionalTraceable<{
            onRequestSent?: () => void;
            signal?: AbortSignal;
        }>
    ): Promise<Traceable<SendTransactionResponse>>;
    /** @deprecated use sendTransaction(transaction, options) instead */
    public sendTransaction(
        transaction: SendTransactionRequest,
        onRequestSent?: () => void
    ): Promise<Traceable<SendTransactionResponse>>;
    public async sendTransaction(
        transaction: SendTransactionRequest,
        optionsOrOnRequestSent?:
            | OptionalTraceable<{
                  onRequestSent?: () => void;
                  signal?: AbortSignal;
              }>
            | (() => void)
    ): Promise<Traceable<SendTransactionResponse>> {
        // TODO: remove deprecated method
        const options: OptionalTraceable<{
            onRequestSent?: () => void;
            signal?: AbortSignal;
        }> = {};
        if (typeof optionsOrOnRequestSent === 'function') {
            options.onRequestSent = optionsOrOnRequestSent;
        } else {
            options.onRequestSent = optionsOrOnRequestSent?.onRequestSent;
            options.signal = optionsOrOnRequestSent?.signal;
            options.traceId = optionsOrOnRequestSent?.traceId;
        }

        // Validate transaction
        const validationError = validateSendTransactionRequest(transaction);
        if (validationError) {
            if (isQaModeEnabled()) {
                console.error('SendTransactionRequest validation failed: ' + validationError);
            } else {
                throw new TonConnectError(
                    'SendTransactionRequest validation failed: ' + validationError
                );
            }
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

        const sessionInfo = this.getSessionInfo();
        const traceId = options?.traceId ?? UUIDv7();
        this.tracker.trackTransactionSentForSignature(
            this.wallet,
            transaction,
            sessionInfo,
            traceId
        );

        const { validUntil, messages, ...tx } = transaction;
        const from = transaction.from || this.account!.address;
        const network = transaction.network || this.account!.chain;

        if (this.wallet?.account.chain && network !== this.wallet.account.chain) {
            if (!isQaModeEnabled()) {
                throw new WalletWrongNetworkError('Wallet connected to a wrong network', {
                    cause: {
                        expectedChainId: this.wallet?.account.chain,
                        actualChainId: network
                    }
                });
            }
            console.error('Wallet connected to a wrong network', {
                expectedChainId: this.wallet?.account.chain,
                actualChainId: network
            });
        }

        const response = await this.provider!.sendRequest(
            sendTransactionParser.convertToRpcRequest({
                ...tx,
                from,
                network,
                valid_until: validUntil,
                messages: messages.map(({ extraCurrency, payload, stateInit, ...msg }) => ({
                    ...msg,
                    payload: normalizeBase64(payload),
                    stateInit: normalizeBase64(stateInit),
                    extra_currency: extraCurrency
                }))
            }),
            {
                onRequestSent: options.onRequestSent,
                signal: abortController.signal,
                traceId
            }
        );

        if (sendTransactionParser.isError(response)) {
            this.tracker.trackTransactionSigningFailed(
                this.wallet,
                transaction,
                response.error.message,
                response.error.code,
                sessionInfo,
                traceId
            );
            return sendTransactionParser.parseAndThrowError(response);
        }

        const result = sendTransactionParser.convertFromRpcResponse(
            response as SendTransactionRpcResponseSuccess
        );
        this.tracker.trackTransactionSigned(this.wallet, transaction, result, sessionInfo, traceId);
        return { ...result, traceId: response.traceId };
    }

    public async signData(
        data: SignDataPayload,
        options?: OptionalTraceable<{
            onRequestSent?: () => void;
            signal?: AbortSignal;
        }>
    ): Promise<Traceable<SignDataResponse>> {
        const abortController = createAbortController(options?.signal);
        if (abortController.signal.aborted) {
            throw new TonConnectError('data sending was aborted');
        }

        // Validate sign data
        const validationError = validateSignDataPayload(data);
        if (validationError) {
            if (isQaModeEnabled()) {
                console.error('SignDataPayload validation failed: ' + validationError);
            } else {
                throw new TonConnectError('SignDataPayload validation failed: ' + validationError);
            }
        }

        this.checkConnection();
        checkSignDataSupport(this.wallet!.device.features, { requiredTypes: [data.type] });

        const sessionInfo = this.getSessionInfo();
        const traceId = options?.traceId ?? UUIDv7();
        this.tracker.trackDataSentForSignature(this.wallet, data, sessionInfo, traceId);

        const from = data.from || this.account!.address;
        const network = data.network || this.account!.chain;

        if (this.wallet?.account.chain && network !== this.wallet.account.chain) {
            if (!isQaModeEnabled()) {
                throw new WalletWrongNetworkError('Wallet connected to a wrong network', {
                    cause: {
                        expectedChainId: this.wallet?.account.chain,
                        actualChainId: network
                    }
                });
            }
            console.error('Wallet connected to a wrong network', {
                expectedChainId: this.wallet?.account.chain,
                actualChainId: network
            });
        }

        const response = await this.provider!.sendRequest(
            signDataParser.convertToRpcRequest({
                ...data,
                ...(data.type === 'cell' ? { cell: normalizeBase64(data.cell) } : {}),
                from,
                network
            }),
            { onRequestSent: options?.onRequestSent, signal: abortController.signal, traceId }
        );

        if (signDataParser.isError(response)) {
            this.tracker.trackDataSigningFailed(
                this.wallet,
                data,
                response.error.message,
                response.error.code,
                sessionInfo,
                traceId
            );
            return signDataParser.parseAndThrowError(response);
        }

        const result = signDataParser.convertFromRpcResponse(
            response as SignDataRpcResponseSuccess
        );

        this.tracker.trackDataSigned(this.wallet, data, result, sessionInfo, traceId);

        return { ...result, traceId };
    }

    public async signMessage(
        _message: SendTransactionRequest,
        _options?: OptionalTraceable<{
            onRequestSent?: () => void;
            signal?: AbortSignal;
        }>
    ): Promise<Traceable<SignMessageResponse>> {
        throw new TonConnectError('signMessage is not implemented yet');
    }

    /**
     * Set desired network for the connection. Can only be set before connecting.
     * If wallet connects with a different chain, the SDK will throw an error and abort connection.
     * @param network desired network id (e.g., '-239', '-3', or custom). Pass undefined to allow any network.
     */
    public setConnectionNetwork(network?: ChainId): void {
        if (this.connected) {
            throw new TonConnectError('Cannot change network while wallet is connected');
        }
        this.desiredChainId = network;
    }

    /**
     * Disconnect form thw connected wallet and drop current session.
     */
    public async disconnect(options?: OptionalTraceable<{ signal?: AbortSignal }>): Promise<void> {
        if (!this.connected) {
            throw new WalletNotConnectedError();
        }

        const abortController = createAbortController(options?.signal);
        const prevAbortController = this.abortController;
        this.abortController = abortController;

        if (abortController.signal.aborted) {
            throw new TonConnectError('Disconnect was aborted');
        }

        const traceId = options?.traceId ?? UUIDv7();

        this.onWalletDisconnected('dapp', { traceId });
        await this.provider?.disconnect({
            signal: abortController.signal,
            traceId
        });
        prevAbortController?.abort();
    }

    /**
     * Gets the current session ID if available.
     * @returns session ID string or null if not available.
     */
    public async getSessionId(): Promise<string | null> {
        if (!this.provider) {
            return null;
        }

        try {
            const connection = await this.bridgeConnectionStorage.getConnection();
            if (!connection || connection.type !== 'http') {
                return null;
            }

            if ('sessionCrypto' in connection) {
                // Pending connection
                return connection.sessionCrypto.sessionId;
            } else {
                // Established connection
                return connection.session.sessionCrypto.sessionId;
            }
        } catch {
            return null;
        }
    }

    /**
     * POST intent payload to object storage (API: POST with text/plain body, ttl in query).
     * Returns the URL where the wallet can GET the payload.
     */
    private async storeIntentPayloadInObjectStorage(
        objectStorageUrl: string,
        payload: object,
        ttl: number | undefined,
        signal: AbortSignal
    ): Promise<string> {
        const url = new URL(objectStorageUrl);
        if (typeof ttl === 'number' && ttl > 0) {
            url.searchParams.set('ttl', String(ttl));
        }
        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain; charset=UTF-8'
            },
            body: JSON.stringify(payload),
            signal
        });
        const data = (await response.json()) as { get_url?: string; url?: string };
        const getUrl = data.get_url ?? data.url;
        if (!getUrl || typeof getUrl !== 'string') {
            throw new TonConnectError('Invalid response from intent object storage');
        }
        return getUrl;
    }

    /**
     * Resolves object storage URL for intent: options override, then first from wallet list, then default.
     */
    private async resolveObjectStorageUrl(
        options: OptionalTraceable<IntentUrlOptions> | undefined
    ): Promise<string> {
        if (options?.objectStorageUrl) {
            return options.objectStorageUrl;
        }
        const wallets = await TonConnect.getWallets();
        for (const w of wallets) {
            if (isWalletInfoRemote(w) && w.objectStorageUrl) {
                return w.objectStorageUrl;
            }
        }
        return DEFAULT_OBJECT_STORAGE_URL;
    }

    public async sendTransactionIntent(
        transaction: SendTransactionIntentRequest,
        options?: OptionalTraceable<IntentUrlOptions>
    ): Promise<Traceable<SendTransactionIntentResponse>> {
        const abortController = createAbortController(options?.signal);
        if (abortController.signal.aborted) {
            throw new TonConnectError('sendTransactionIntent was aborted');
        }

        const traceId = options?.traceId ?? UUIDv7();
        const sessionInfo = this.getSessionInfo();
        const clientId = sessionInfo?.clientId ?? traceId;

        const connectRequest = resolveIntentConnectRequest(
            options,
            this.createConnectRequest.bind(this)
        );

        const payload = serializeSendTransactionIntent(transaction, {
            id: clientId,
            connectRequest
        });

        const inlineUrl = buildInlineIntentUrl(payload);
        const useObjectStorage = inlineUrl.length > MAX_INLINE_INTENT_URL_LENGTH;

        if (useObjectStorage) {
            const objectStorageUrl = await this.resolveObjectStorageUrl(options);
            const getUrl = await this.storeIntentPayloadInObjectStorage(
                objectStorageUrl,
                payload,
                options?.ttl,
                abortController.signal
            );

            const search = new URLSearchParams();
            search.set('get_url', getUrl);
            search.set('id', clientId);
            if (connectRequest !== undefined) {
                search.set('c', encodeConnectRequestForUrl(connectRequest));
            }

            const url = `tc://intent?${search.toString()}`;
            options?.onIntentUrlReady?.(url);
        } else {
            options?.onIntentUrlReady?.(inlineUrl);
        }

        return await this.waitForIntentResultOrPending<SendTransactionIntentResponse>(clientId, {
            signal: abortController.signal,
            traceId,
            mapResult: result => {
                if (typeof result === 'string') {
                    return { boc: result };
                }

                if (
                    !result ||
                    typeof result !== 'object' ||
                    typeof (result as { boc?: unknown }).boc !== 'string'
                ) {
                    throw new TonConnectError(
                        'Wallet returned an invalid transaction intent result'
                    );
                }

                return result as SendTransactionIntentResponse;
            }
        });
    }

    public async signDataIntent(
        data: SignDataIntentRequest,
        options?: OptionalTraceable<IntentUrlOptions>
    ): Promise<Traceable<SignDataIntentResponse>> {
        const abortController = createAbortController(options?.signal);
        if (abortController.signal.aborted) {
            throw new TonConnectError('signDataIntent was aborted');
        }

        const traceId = options?.traceId ?? UUIDv7();
        const sessionInfo = this.getSessionInfo();
        const clientId = sessionInfo?.clientId ?? traceId;

        const connectRequest = resolveIntentConnectRequest(
            options,
            this.createConnectRequest.bind(this)
        );

        const payload = serializeSignDataIntent(data, {
            id: clientId,
            connectRequest,
            manifestUrl: this.dappSettings.manifestUrl
        });

        const inlineUrl = buildInlineIntentUrl(payload);
        const useObjectStorage = inlineUrl.length > MAX_INLINE_INTENT_URL_LENGTH;

        if (useObjectStorage) {
            const objectStorageUrl = await this.resolveObjectStorageUrl(options);
            const getUrl = await this.storeIntentPayloadInObjectStorage(
                objectStorageUrl,
                payload,
                options?.ttl,
                abortController.signal
            );

            const search = new URLSearchParams();
            search.set('get_url', getUrl);
            search.set('id', clientId);
            if (connectRequest !== undefined) {
                search.set('c', encodeConnectRequestForUrl(connectRequest));
            }

            const url = `tc://intent?${search.toString()}`;
            options?.onIntentUrlReady?.(url);
        } else {
            options?.onIntentUrlReady?.(inlineUrl);
        }

        return await this.waitForIntentResultOrPending<SignDataIntentResponse>(clientId, {
            signal: abortController.signal,
            traceId,
            mapResult: result => {
                if (!result || typeof result !== 'object') {
                    throw new TonConnectError('Wallet returned an invalid sign-data intent result');
                }

                return result as SignDataIntentResponse;
            }
        });
    }

    public async signMessageIntent(
        message: SignMessageIntentRequest,
        options?: OptionalTraceable<IntentUrlOptions>
    ): Promise<Traceable<SignMessageIntentResponse>> {
        const abortController = createAbortController(options?.signal);
        if (abortController.signal.aborted) {
            throw new TonConnectError('signMessageIntent was aborted');
        }

        const traceId = options?.traceId ?? UUIDv7();
        const sessionInfo = this.getSessionInfo();
        const clientId = sessionInfo?.clientId ?? traceId;

        const connectRequest = resolveIntentConnectRequest(
            options,
            this.createConnectRequest.bind(this)
        );

        const payload = serializeSignMessageIntent(message, {
            id: clientId,
            connectRequest
        });

        const inlineUrl = buildInlineIntentUrl(payload);
        const useObjectStorage = inlineUrl.length > MAX_INLINE_INTENT_URL_LENGTH;

        if (useObjectStorage) {
            const objectStorageUrl = await this.resolveObjectStorageUrl(options);
            const getUrl = await this.storeIntentPayloadInObjectStorage(
                objectStorageUrl,
                payload,
                options?.ttl,
                abortController.signal
            );

            const search = new URLSearchParams();
            search.set('get_url', getUrl);
            search.set('id', clientId);
            if (connectRequest !== undefined) {
                search.set('c', encodeConnectRequestForUrl(connectRequest));
            }

            const url = `tc://intent?${search.toString()}`;
            options?.onIntentUrlReady?.(url);
        } else {
            options?.onIntentUrlReady?.(inlineUrl);
        }

        return await this.waitForIntentResultOrPending<SignMessageIntentResponse>(clientId, {
            signal: abortController.signal,
            traceId,
            mapResult: result => {
                if (typeof result === 'string') {
                    return { internalBoc: result };
                }

                if (
                    !result ||
                    typeof result !== 'object' ||
                    typeof (result as { internalBoc?: unknown }).internalBoc !== 'string'
                ) {
                    throw new TonConnectError(
                        'Wallet returned an invalid sign-message intent result'
                    );
                }

                return result as SignMessageIntentResponse;
            }
        });
    }

    public async sendActionIntent(
        action: SendActionIntentRequest,
        options?: OptionalTraceable<IntentUrlOptions>
    ): Promise<Traceable<SendActionIntentResponse>> {
        const abortController = createAbortController(options?.signal);
        if (abortController.signal.aborted) {
            throw new TonConnectError('sendActionIntent was aborted');
        }

        const traceId = options?.traceId ?? UUIDv7();
        const sessionInfo = this.getSessionInfo();
        const clientId = sessionInfo?.clientId ?? traceId;

        const connectRequest = resolveIntentConnectRequest(
            options,
            this.createConnectRequest.bind(this)
        );

        const payload = serializeSendActionIntent(action, {
            id: clientId,
            connectRequest
        });

        const inlineUrl = buildInlineIntentUrl(payload);
        const useObjectStorage = inlineUrl.length > MAX_INLINE_INTENT_URL_LENGTH;

        if (useObjectStorage) {
            const objectStorageUrl = await this.resolveObjectStorageUrl(options);
            const getUrl = await this.storeIntentPayloadInObjectStorage(
                objectStorageUrl,
                payload,
                options?.ttl,
                abortController.signal
            );

            const search = new URLSearchParams();
            search.set('get_url', getUrl);
            search.set('id', clientId);
            if (connectRequest !== undefined) {
                search.set('c', encodeConnectRequestForUrl(connectRequest));
            }

            const url = `tc://intent?${search.toString()}`;
            options?.onIntentUrlReady?.(url);
        } else {
            options?.onIntentUrlReady?.(inlineUrl);
        }

        return await this.waitForIntentResultOrPending<SendActionIntentResponse>(clientId, {
            signal: abortController.signal,
            traceId,
            mapResult: result => {
                if (typeof result === 'string') {
                    // For action intents with string result, assume it is a signed transaction BOC
                    return { boc: result } as SendActionIntentResponse;
                }

                if (!result || typeof result !== 'object') {
                    throw new TonConnectError('Wallet returned an invalid action intent result');
                }

                return result as SendActionIntentResponse;
            }
        });
    }

    private getSessionInfo(): { clientId: string | null; walletId: string | null } | null {
        if (this.provider?.type !== 'http') {
            return null;
        }

        if (!('session' in this.provider)) {
            return null;
        }

        try {
            const session = this.provider.session as BridgeSession | BridgePartialSession | null;
            if (!session) {
                return null;
            }
            const clientId = session.sessionCrypto.sessionId;
            let walletId = null;
            if ('walletPublicKey' in session) {
                walletId = session.walletPublicKey;
            }
            return { clientId, walletId };
        } catch {
            return null;
        }
    }

    private intentResponseListener(response: TraceableWalletResponse<RpcMethod>): void {
        const id = String((response as { id?: string | number }).id ?? '');
        const traceId = (response as { traceId?: string }).traceId ?? UUIDv7();

        const payload: { id: string; result?: unknown; error?: unknown; traceId: string } = {
            id,
            traceId
        };

        if ('result' in response) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (payload as any).result = (response as { result?: unknown }).result;
        }

        if ('error' in response) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (payload as any).error = (response as { error?: unknown }).error;
        }

        this.intentResponseSubscriptions.forEach(callback => callback(payload));
    }

    private waitForIntentResult<TResponse extends {}>(
        clientId: string,
        options: {
            signal?: AbortSignal;
            traceId: string;
            mapResult: (result: unknown) => TResponse;
        }
    ): Promise<Traceable<TResponse>> {
        const { signal, traceId, mapResult } = options;

        return new Promise<Traceable<TResponse>>((resolve, reject) => {
            if (signal?.aborted) {
                reject(new TonConnectError('Intent request was aborted'));
                return;
            }

            const unsubscribe = this.onIntentResponse(payload => {
                if (!payload.id || payload.id !== clientId) {
                    return;
                }

                cleanup();

                if (payload.error) {
                    const message =
                        typeof (payload.error as { message?: string })?.message === 'string'
                            ? (payload.error as { message?: string }).message
                            : 'Wallet returned an error for intent';

                    reject(new TonConnectError(message));
                    return;
                }

                if (payload.result === undefined) {
                    reject(new TonConnectError('Wallet returned an invalid intent result'));
                    return;
                }

                try {
                    const mapped = mapResult(payload.result);

                    resolve({
                        ...mapped,
                        traceId
                    });
                } catch (e) {
                    if (e instanceof TonConnectError) {
                        reject(e);
                    } else {
                        reject(new TonConnectError('Wallet returned an invalid intent result'));
                    }
                }
            });

            const onAbort = (): void => {
                cleanup();
                reject(new TonConnectError('Intent request was aborted'));
            };

            const cleanup = (): void => {
                unsubscribe();
                signal?.removeEventListener('abort', onAbort);
            };

            if (signal) {
                signal.addEventListener('abort', onAbort);
            }
        });
    }

    /**
     * Waits for intent result: prefers resolving via bridge pending request (registerPendingIntent)
     * so the response id matches and no "orphan" path is used; falls back to onIntentResponse subscription.
     */
    private async waitForIntentResultOrPending<TResponse extends {}>(
        clientId: string,
        options: {
            signal?: AbortSignal;
            traceId: string;
            mapResult: (result: unknown) => TResponse;
        }
    ): Promise<Traceable<TResponse>> {
        if (this.provider?.type === 'http' && 'registerPendingIntent' in this.provider) {
            const response = await (this.provider as BridgeProvider).registerPendingIntent(
                clientId,
                { signal: options.signal, traceId: options.traceId }
            );

            const raw = response as { result?: unknown; error?: unknown; traceId?: string };

            if (raw.error) {
                const message =
                    typeof (raw.error as { message?: string })?.message === 'string'
                        ? (raw.error as { message?: string }).message
                        : 'Wallet returned an error for intent';
                throw new TonConnectError(message);
            }

            if (raw.result === undefined) {
                throw new TonConnectError('Wallet returned an invalid intent result');
            }

            try {
                const mapped = options.mapResult(raw.result);
                const traceId = raw.traceId ?? options.traceId;
                return { ...mapped, traceId };
            } catch (e) {
                if (e instanceof TonConnectError) {
                    throw e;
                }
                throw new TonConnectError('Wallet returned an invalid intent result');
            }
        }

        return await this.waitForIntentResult<TResponse>(clientId, options);
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
                    this.unPauseConnection().catch(() => {});
                }
            });
        } catch (e) {
            logError('Cannot subscribe to the document.visibilitychange: ', e);
        }
    }

    private initAnalytics(
        manifestUrl: string,
        eventDispatcher: EventDispatcher<SdkActionEvent>,
        options?: TonConnectOptions
    ): void {
        const analyticsSettings: AnalyticsSettings | undefined = options?.analytics;
        const mode = analyticsSettings?.mode ?? 'telemetry';

        if (mode === 'off') {
            return;
        }

        const analytics = new AnalyticsManager({
            environment: this.environment,
            mode
        });
        this.analytics = analytics;

        const telegramUser = this.environment.getTelegramUser();

        const sharedAnalyticsData: Parameters<typeof analytics.scoped>[0] = {
            browser: this.environment.getBrowser(),
            platform: this.environment.getPlatform(),
            manifest_json_url: manifestUrl,
            origin_url: getOriginWithPath,
            locale: this.environment.getLocale()
        };

        if (telegramUser) {
            sharedAnalyticsData.tg_id = telegramUser.id;
            sharedAnalyticsData.tma_is_premium = telegramUser.isPremium;
        }

        bindEventsTo(eventDispatcher, analytics.scoped(sharedAnalyticsData));
    }

    private createProvider(
        wallet: WalletConnectionSource | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[]
    ): Provider {
        let provider: Provider;

        if (!Array.isArray(wallet) && isWalletConnectionSourceJS(wallet)) {
            provider = new InjectedProvider(
                this.dappSettings.storage,
                wallet.jsBridgeKey,
                this.analytics
            );
        } else if (!Array.isArray(wallet) && isWalletConnectionSourceWalletConnect(wallet)) {
            provider = new WalletConnectProvider(this.dappSettings.storage);
        } else {
            provider = new BridgeProvider(this.dappSettings.storage, wallet, this.analytics);
        }

        provider.listen(this.walletEventsListener.bind(this));
        if ((provider as HTTPProvider).type === 'http' && 'onOrphanResponse' in provider) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (provider as any).onOrphanResponse(
                this.intentResponseListener.bind(this) as (
                    response: TraceableWalletResponse<RpcMethod>
                ) => void
            );
        }
        return provider;
    }

    private walletEventsListener(e: TraceableWalletEvent): void {
        switch (e.event) {
            case 'connect':
                this.onWalletConnected(e.payload, { traceId: e.traceId });
                break;
            case 'connect_error':
                this.tracker.trackConnectionError(
                    e.payload.message,
                    e.payload.code,
                    this.getSessionInfo(),
                    e.traceId
                );
                const walletError = connectErrorsParser.parseError(e.payload);
                this.onWalletConnectError(walletError);
                break;
            case 'disconnect':
                this.onWalletDisconnected('wallet', { traceId: e.traceId });
        }
    }

    private onWalletConnected(
        connectEvent: ConnectEventSuccess['payload'],
        options: Traceable
    ): void {
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
            this.walletsRequiredFeatures
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

        if (this.desiredChainId && wallet.account.chain !== this.desiredChainId) {
            const expectedChainId = this.desiredChainId;
            const actualChainId = wallet.account.chain;
            this.provider?.disconnect();
            this.onWalletConnectError(
                new WalletWrongNetworkError('Wallet connected to a wrong network', {
                    cause: { expectedChainId, actualChainId }
                })
            );
            return;
        }

        if (tonProofItem) {
            const validationError = validateTonProofItemReply(tonProofItem as unknown);
            let tonProof: TonProofItemReply | undefined = undefined;
            if (validationError) {
                if (isQaModeEnabled()) {
                    console.error('TonProofItem validation failed: ' + validationError);
                }
                tonProof = {
                    name: 'ton_proof',
                    error: {
                        code: CONNECT_ITEM_ERROR_CODES.UNKNOWN_ERROR,
                        message: validationError
                    }
                };
            } else {
                try {
                    if ('proof' in tonProofItem) {
                        tonProof = {
                            name: 'ton_proof',
                            proof: {
                                timestamp: tonProofItem.proof.timestamp,
                                domain: {
                                    lengthBytes: tonProofItem.proof.domain.lengthBytes,
                                    value: tonProofItem.proof.domain.value
                                },
                                payload: tonProofItem.proof.payload,
                                signature: tonProofItem.proof.signature
                            }
                        };
                    } else if ('error' in tonProofItem) {
                        tonProof = {
                            name: 'ton_proof',
                            error: {
                                code: tonProofItem.error.code,
                                message: tonProofItem.error.message
                            }
                        };
                    } else {
                        throw new TonConnectError('Invalid data format');
                    }
                } catch (e) {
                    tonProof = {
                        name: 'ton_proof',
                        error: {
                            code: CONNECT_ITEM_ERROR_CODES.UNKNOWN_ERROR,
                            message: 'Invalid data format'
                        }
                    };
                }
            }

            wallet.connectItems = { tonProof };
        }

        this.wallet = wallet;

        const sessionInfo = this.getSessionInfo();
        this.tracker.trackConnectionCompleted(wallet, sessionInfo, options?.traceId);
    }

    private onWalletConnectError(error: TonConnectError): void {
        this.statusChangeErrorSubscriptions.forEach(errorsHandler => errorsHandler(error));
        logDebug(error);

        if (error instanceof ManifestNotFoundError || error instanceof ManifestContentErrorError) {
            logError(error);
            throw error;
        }
    }

    private onWalletDisconnected(scope: 'wallet' | 'dapp', options: Traceable): void {
        const sessionInfo = this.getSessionInfo();
        this.tracker.trackDisconnection(this.wallet, scope, sessionInfo, options?.traceId);
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
                name: 'ton_addr',
                ...(this.desiredChainId ? { network: this.desiredChainId } : {})
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

    /**
     * Builds a full ConnectRequest for use in intent URLs (e.g. from UI layer).
     * Use this when you need to pass connectRequest into intent options.
     */
    public getConnectRequestForIntent(
        additionalRequest?: ConnectAdditionalRequest
    ): ConnectRequest {
        return this.createConnectRequest(additionalRequest);
    }
}

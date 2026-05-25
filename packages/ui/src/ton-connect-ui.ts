import {
    Account,
    EmbeddedRequest,
    BrowserEventDispatcher,
    ConnectAdditionalRequest,
    OptionalTraceable,
    RequiredFeatures,
    SignDataPayload,
    SignDataResponse,
    SignMessageResponse,
    Traceable,
    UUIDv7,
    WalletInfoCurrentlyEmbedded,
    Consumable
} from '@tonconnect/sdk';
import {
    isTelegramUrl,
    isWalletInfoCurrentlyEmbedded,
    ITonConnect,
    SendTransactionRequest,
    SendTransactionResponse,
    TonConnect,
    TonConnectError,
    Wallet,
    WalletInfo,
    WalletNotSupportFeatureError,
    SessionCrypto,
    ChainId
} from '@tonconnect/sdk';
import type { SignMessageRequest } from '@tonconnect/sdk';
import { widgetController } from 'src/app/widget-controller';
import { TonConnectUIError } from 'src/errors/ton-connect-ui.error';
import { TonConnectUiCreateOptions } from 'src/models/ton-connect-ui-create-options';
import { PreferredWalletStorage, WalletInfoStorage } from 'src/storage';
import {
    createMacrotaskAsync,
    getSystemTheme,
    preloadImages,
    subscribeToThemeChange
} from 'src/app/utils/web-api';
import { TonConnectUiOptions } from 'src/models/ton-connect-ui-options';
import { setBorderRadius, setColors, setTheme } from 'src/app/state/theme-state';
import { mergeOptions } from 'src/app/utils/options';
import { appState, setAppState } from 'src/app/state/app.state';
import { unwrap } from 'solid-js/store';
import {
    Action,
    ActionKind,
    confirmActionNames,
    errorActionNames,
    setLastSelectedWalletInfo,
    successActionNames
} from 'src/app/state/modals-state';
import { ActionConfiguration, StrictActionConfiguration } from 'src/models/action-configuration';
import { ConnectedWallet, WalletInfoWithOpenMethod } from 'src/models/connected-wallet';
import type {
    EmbeddedTResponse,
    EmbeddedSendTransactionResponse,
    EmbeddedSignDataResponse,
    EmbeddedSignMessageResponse
} from 'src/models/embedded-response';
import { applyWalletsListConfiguration, eqWalletName } from 'src/app/utils/wallets';
import { uniq } from 'src/app/utils/array';
import { Loadable } from 'src/models/loadable';
import { WalletsModalManager } from 'src/managers/wallets-modal-manager';
import { TransactionModalManager } from 'src/managers/transaction-modal-manager';
import { WalletsModal, WalletsModalCloseReason, WalletsModalState } from 'src/models/wallets-modal';
import { isInTMA, sendExpand } from 'src/app/utils/tma-api';
import {
    redirectToTelegram,
    redirectToWallet,
    enrichUniversalLink
} from 'src/app/utils/url-strategy-helpers';
import { SingleWalletModalManager } from 'src/managers/single-wallet-modal-manager';
import { SingleWalletModal, SingleWalletModalState } from 'src/models/single-wallet-modal';
import { TonConnectUITracker } from 'src/tracker/ton-connect-ui-tracker';
import { tonConnectUiVersion } from 'src/constants/version';
import { ReturnStrategy } from './models';
import { TonConnectEnvironment } from 'src/environment/ton-connect-environment';
import {
    WALLET_CONNECT_ABOUT_URL,
    WALLET_CONNECT_APP_NAME,
    WALLET_CONNECT_WALLET_NAME
} from 'src/app/env/WALLET_CONNECT';
import { IMG } from 'src/app/env/IMG';
import { PickRequired } from 'src/utils/pick-required';

export class TonConnectUI {
    /**
     * Returns the list of available wallets.
     * @returns Promise that resolves to an array of {@link WalletInfo} objects.
     */
    public static getWallets(): Promise<WalletInfo[]> {
        return TonConnect.getWallets();
    }

    private readonly walletInfoStorage = new WalletInfoStorage();

    private readonly preferredWalletStorage = new PreferredWalletStorage();

    /**
     * Emits user action event to the EventDispatcher. By default, it uses `window.dispatchEvent` for browser environment.
     * @private
     */
    private readonly tracker: TonConnectUITracker;

    private walletInfo: WalletInfoWithOpenMethod | null = null;

    private systemThemeChangeUnsubscribe: (() => void) | null = null;

    private actionsConfiguration?: ActionConfiguration;

    private readonly walletsList: Promise<WalletInfo[]>;

    private _walletsRequiredFeatures?: RequiredFeatures;

    /**
     * Required features that wallets must support to appear in the wallets list.
     * Wallets not supporting these features are excluded from the UI.
     */
    public get walletsRequiredFeatures(): RequiredFeatures | undefined {
        return this._walletsRequiredFeatures;
    }

    private _walletsPreferredFeatures?: RequiredFeatures;

    /**
     * Preferred features used to sort and rank wallets in the wallets list.
     * Wallets supporting these features appear first in the UI.
     */
    public get walletsPreferredFeatures(): RequiredFeatures | undefined {
        return this._walletsPreferredFeatures;
    }

    private connectRequestParametersCallback?: (
        parameters: ConnectAdditionalRequest | undefined
    ) => void;

    /**
     * TonConnect instance.
     */
    public readonly connector: ITonConnect;

    /**
     * Manages the modal window state.
     */
    public readonly modal: WalletsModal;

    private readonly modalManager: WalletsModalManager;

    /**
     * Manages the single wallet modal window state.
     * TODO: make it public when interface will be ready for external usage.
     */
    private readonly singleWalletModal: SingleWalletModal;

    /**
     * Manages the transaction modal window state.
     * TODO: make it public when interface will be ready for external usage.
     */
    private readonly transactionModal: TransactionModalManager;

    /**
     * Promise that resolves after end of the connection restoring process (promise fires after `onStatusChange`,
     * so you can get actual information about wallet and session after when promise resolved).
     * Resolved value `true`/`false` indicates if the session was restored successfully.
     */
    public readonly connectionRestored = Promise.resolve(false);

    /**
     * Current connection status.
     */
    public get connected(): boolean {
        return this.connector.connected;
    }

    /**
     * Current connected account or null.
     */
    public get account(): Account | null {
        return this.connector.account;
    }

    /**
     * Current connected wallet app and its info or null.
     */
    public get wallet(): Wallet | (Wallet & WalletInfoWithOpenMethod) | null {
        if (!this.connector.wallet) {
            return null;
        }

        return {
            ...this.connector.wallet,
            ...this.walletInfo
        };
    }

    /**
     * Sets and applies new UI options. Pass a partial options object; it is merged with the current options.
     * @param options - Partial UI options to apply.
     * @throws {@link TonConnectUIError} when `options.buttonRootId` is set but the element does not exist in the document.
     */
    public set uiOptions(options: TonConnectUiOptions) {
        this.checkButtonRootExist(options.buttonRootId);

        this.actionsConfiguration = options.actionsConfiguration;

        if ('walletsRequiredFeatures' in options) {
            this._walletsRequiredFeatures = options.walletsRequiredFeatures;
        }

        if ('walletsPreferredFeatures' in options) {
            this._walletsPreferredFeatures = options.walletsPreferredFeatures;
        }

        if (options.uiPreferences?.theme) {
            if (options.uiPreferences?.theme !== 'SYSTEM') {
                this.systemThemeChangeUnsubscribe?.();
                setTheme(options.uiPreferences.theme, options.uiPreferences.colorsSet);
            } else {
                setTheme(getSystemTheme(), options.uiPreferences.colorsSet);

                if (!this.systemThemeChangeUnsubscribe) {
                    this.systemThemeChangeUnsubscribe = subscribeToThemeChange(setTheme);
                }
            }
        } else {
            if (options.uiPreferences?.colorsSet) {
                setColors(options.uiPreferences.colorsSet);
            }
        }

        if (options.uiPreferences?.borderRadius) {
            setBorderRadius(options.uiPreferences.borderRadius);
        }

        setAppState(state => {
            const merged = mergeOptions(
                {
                    ...(options.language && { language: options.language }),
                    ...(!!options.actionsConfiguration?.returnStrategy && {
                        returnStrategy: options.actionsConfiguration.returnStrategy
                    }),
                    ...(!!options.actionsConfiguration?.twaReturnUrl && {
                        twaReturnUrl: options.actionsConfiguration.twaReturnUrl
                    }),
                    ...(!!options.walletsListConfiguration && {
                        walletsListConfiguration: options.walletsListConfiguration
                    })
                },
                unwrap(state)
            );

            if (options.buttonRootId !== undefined) {
                merged.buttonRootId = options.buttonRootId;
            }

            if (options.enableAndroidBackHandler !== undefined) {
                merged.enableAndroidBackHandler = options.enableAndroidBackHandler;
            }

            return merged;
        });
    }

    // TODO: `actionsConfiguration.twaReturnUrl` is used only in `connectWallet` method, but it's not used in `sendTransaction` method, NEED TO FIX IT
    /**
     * Creates a new TonConnectUI instance and mounts the widget into the DOM.
     * @param options - Creation options. Either `manifestUrl` or `connector` must be provided.
     * @throws {@link TonConnectUIError} when neither `manifestUrl` nor `connector` is specified in `options`.
     * @throws {@link TonConnectUIError} when `options.buttonRootId` is set but the element does not exist in the document (the constructor applies the initial UI options).
     */
    constructor(options?: TonConnectUiCreateOptions) {
        let eventDispatcher = options?.eventDispatcher ?? new BrowserEventDispatcher();

        if (options && 'connector' in options && options.connector) {
            this.connector = options.connector;
        } else if (options && 'manifestUrl' in options && options.manifestUrl) {
            this.connector = new TonConnect({
                manifestUrl: options.manifestUrl,
                eventDispatcher,
                walletsRequiredFeatures: options.walletsRequiredFeatures,
                environment: new TonConnectEnvironment(),
                analytics: options.analytics
            });
        } else {
            throw new TonConnectUIError(
                'You have to specify a `manifestUrl` or a `connector` in the options.'
            );
        }

        this.tracker = new TonConnectUITracker({
            eventDispatcher,
            tonConnectUiVersion: tonConnectUiVersion
        });

        this.modalManager = new WalletsModalManager({
            connector: this.connector,
            tracker: this.tracker,
            setConnectRequestParametersCallback: (
                callback: (parameters?: ConnectAdditionalRequest) => void
            ) => {
                this.connectRequestParametersCallback = callback;
            }
        });
        this.modal = this.modalManager;

        this.singleWalletModal = new SingleWalletModalManager({
            connector: this.connector,
            tracker: this.tracker,
            setConnectRequestParametersCallback: (
                callback: (parameters?: ConnectAdditionalRequest) => void
            ) => {
                this.connectRequestParametersCallback = callback;
            }
        });

        this.transactionModal = new TransactionModalManager({
            connector: this.connector
        });

        this._walletsRequiredFeatures = options.walletsRequiredFeatures;

        this._walletsPreferredFeatures = options.walletsPreferredFeatures;

        this.walletsList = this.getWallets();

        this.walletsList.then(list => preloadImages(uniq(list.map(item => item.imageUrl))));

        const rootId = this.normalizeWidgetRoot(options?.widgetRootId);

        this.subscribeToWalletChange();

        if (options?.restoreConnection !== false) {
            this.connectionRestored = createMacrotaskAsync(async () => {
                this.tracker.trackConnectionRestoringStarted();
                await this.connector.restoreConnection();

                if (!this.connector.connected) {
                    this.tracker.trackConnectionRestoringError('Connection was not restored');
                    this.walletInfoStorage.removeWalletInfo();
                } else {
                    this.tracker.trackConnectionRestoringCompleted(this.wallet);
                }

                return this.connector.connected;
            });
        }

        this.uiOptions = mergeOptions(options, { uiPreferences: { theme: 'SYSTEM' } });
        const preferredWalletName = this.preferredWalletStorage.getPreferredWalletAppName();
        setAppState({
            connector: this.connector,
            preferredWalletAppName: preferredWalletName
        });

        widgetController.renderApp(rootId, this);
    }

    /**
     * Use it to customize ConnectRequest and add `tonProof` payload.
     * You can call it multiple times to set updated tonProof payload if previous one is outdated.
     * If `connectRequestParameters.state === 'loading'` a loader appears instead of the qr code in the wallets modal.
     * If `connectRequestParameters.state` was changed to 'ready' or its value has been changed, the QR is re-rendered.
     */
    public setConnectRequestParameters(
        connectRequestParameters: Loadable<ConnectAdditionalRequest> | undefined | null
    ): void {
        setAppState({ connectRequestParameters });
        if (connectRequestParameters?.state === 'ready' || !connectRequestParameters) {
            this.connectRequestParametersCallback?.(connectRequestParameters?.value);
        }
    }

    /**
     * Set desired network for the connection. Can only be set before connecting.
     * If wallet connects with a different chain, the SDK throws an error and aborts connection.
     * @param network desired network id (e.g., '-239', '-3', or custom). Pass undefined to allow any network.
     */
    public setConnectionNetwork(network?: ChainId): void {
        this.connector.setConnectionNetwork(network);
    }

    /**
     * Returns available wallets list.
     */
    public async getWallets(): Promise<WalletInfo[]> {
        return this.connector.getWallets();
    }

    /**
     * Subscribes to connection status changes.
     * @param callback - Called with the connected wallet on connect, or `null` on disconnect.
     * @param errorsHandler - Optional handler called when a {@link TonConnectError} occurs.
     * @returns Unsubscribe function — call it to stop receiving status updates.
     */
    public onStatusChange(
        callback: (wallet: ConnectedWallet | null) => void,
        errorsHandler?: (err: TonConnectError) => void
    ): ReturnType<ITonConnect['onStatusChange']> {
        return this.connector.onStatusChange(async wallet => {
            if (wallet) {
                const lastSelectedWalletInfo = await this.getSelectedWalletInfo(wallet);

                callback({
                    ...wallet,
                    ...(lastSelectedWalletInfo || this.walletInfoStorage.getWalletInfo())!
                });
            } else {
                callback(wallet);
            }
        }, errorsHandler);
    }

    /**
     * Opens the modal window, returns a promise that resolves after the modal window is opened.
     */
    public async openModal(options?: OptionalTraceable): Promise<void> {
        const traceId = options?.traceId ?? UUIDv7();
        await this.modal.open({ traceId });

        const sessionId = await this.getSessionId();
        const visibleWallets = widgetController.getLastVisibleWallets();

        this.tracker.trackWalletModalOpened(
            visibleWallets.wallets.map(wallet => wallet.name),
            sessionId,
            options?.traceId
        );
    }

    /**
     * Closes the modal window.
     */
    public closeModal(reason?: WalletsModalCloseReason): void {
        this.modal.close(reason);
    }

    /**
     * Subscribe to the modal window state changes, returns a function which has to be called to unsubscribe.
     */
    public onModalStateChange(onChange: (state: WalletsModalState) => void): () => void {
        return this.modal.onStateChange(onChange);
    }

    /**
     * Returns current modal window state.
     */
    public get modalState(): WalletsModalState {
        return this.modal.state;
    }

    /**
     * Opens the single wallet modal window, returns a promise that resolves after the modal window is opened.
     * @experimental
     */
    public async openSingleWalletModal(wallet: string): Promise<void> {
        return this.singleWalletModal.open(wallet);
    }

    /**
     * Close the single wallet modal window.
     * @experimental
     */
    public closeSingleWalletModal(closeReason?: WalletsModalCloseReason): void {
        this.singleWalletModal.close(closeReason);
    }

    /**
     * Subscribe to the single wallet modal window state changes, returns a function which has to be called to unsubscribe.
     * @experimental
     */
    public onSingleWalletModalStateChange(
        onChange: (state: SingleWalletModalState) => void
    ): () => void {
        return this.singleWalletModal.onStateChange(onChange);
    }

    /**
     * Returns current single wallet modal window state.
     * @experimental
     */
    public get singleWalletModalState(): SingleWalletModalState {
        return this.singleWalletModal.state;
    }

    /**
     * @deprecated Use `tonConnectUI.openModal()` instead. Will be removed in the next major version.
     * Opens the modal window and handles a wallet connection.
     * @param options - Optional tracing options.
     * @returns Promise that resolves to the connected wallet.
     * @throws {@link TonConnectUIError} when the connection is aborted or the user cancels.
     */
    public async connectWallet(options?: OptionalTraceable): Promise<ConnectedWallet> {
        const traceId = options?.traceId ?? UUIDv7();

        const walletsList = await this.getWallets();
        const embeddedWallet = walletsList.find(isWalletInfoCurrentlyEmbedded);

        if (embeddedWallet) {
            return await this.connectEmbeddedWallet(embeddedWallet, { traceId });
        } else {
            return await this.connectExternalWallet({ traceId });
        }
    }

    /**
     * Disconnects the wallet and clears stored session data.
     * @param options - Optional tracing options.
     * @returns Promise that resolves when the disconnect is complete.
     */
    public disconnect(options?: OptionalTraceable): Promise<void> {
        const traceId = options?.traceId ?? UUIDv7();

        this.tracker.trackDisconnection(this.wallet, 'dapp');

        widgetController.clearAction();
        widgetController.removeSelectedWalletInfo();
        this.walletInfoStorage.removeWalletInfo();
        return this.connector.disconnect({ traceId });
    }

    /**
     * Opens the modal window and handles the transaction sending.
     *
     * Pass `options.enableEmbeddedRequest: true` to allow the request to ride along with the
     * connect URL on mobile, eliminating a round-trip. With that flag, the result is always the
     * embedded shape:
     *
     * - `{ hasResponse: true, response }` — the transaction was signed, either folded into connect
     *   by an embedded-request-capable wallet, or via the normal bridge flow.
     * - `{ hasResponse: false, connectResult: { dispatched } }` — the wallet connected but did not
     *   return a signed transaction. The dApp must decide how to recover:
     *     - `dispatched: false` — the request never reached the wallet.
     *     - `dispatched: true` — **the request was delivered to the wallet inside the connect
     *       URL.** The wallet may have already signed and submitted it; you just didn't get the
     *       response. **Do not retry silently.** Surface an explicit retry button to the user, and
     *       ideally check on-chain state (e.g. the user's transaction history for the destination,
     *       queryId and amount) before re-submitting to avoid a duplicate transaction.
     *
     * Without the flag the method throws if the wallet is not connected and returns the plain
     * `SendTransactionResponse` otherwise.
     *
     * @param tx transaction to send.
     * @param options modal and notifications behaviour settings; set `enableEmbeddedRequest: true`
     * to opt into the connect-and-send flow described above.
     * @returns Promise that resolves to the transaction response.
     * @throws {@link TonConnectUIError} when no wallet is connected and `options.onConnected` is not provided.
     * @throws {@link TonConnectUIError} when the user cancels the transaction in the modal.
     * @throws {@link TonConnectError} subclasses raised by the underlying SDK call (e.g. `WalletWrongNetworkError`, `WalletNotSupportFeatureError`, `UserRejectsError`, `BadRequestError`, `UnknownAppError`) are propagated unchanged.
     */
    public async sendTransaction(
        tx: SendTransactionRequest,
        options?: ActionOptions
    ): Promise<OptionalTraceable<SendTransactionResponse>>;
    public async sendTransaction(
        tx: SendTransactionRequest,
        options?: EmbeddedActionOptions
    ): Promise<OptionalTraceable<EmbeddedSendTransactionResponse>>;
    public async sendTransaction(
        tx: SendTransactionRequest,
        options?: ActionOptions | EmbeddedActionOptions
    ): Promise<
        | OptionalTraceable<SendTransactionResponse>
        | OptionalTraceable<EmbeddedSendTransactionResponse>
    > {
        const traceId = options?.traceId ?? UUIDv7();

        this.tracker.trackTransactionSentForSignature(this.wallet, tx);

        const handlers = {
            onAbort: () => {
                this.tracker.trackTransactionSigningFailed(
                    this.wallet,
                    tx,
                    'Transaction was cancelled'
                );
                return new TonConnectUIError('Transaction was not sent');
            },
            sendRequestBuilder: options => async () => {
                const result = await this.connector.sendTransaction(tx, options);
                this.tracker.trackTransactionSigned(this.wallet, tx, result);
                return result;
            }
        } satisfies BridgeFlowHandlers<SendTransactionResponse>;

        const kind: ActionKind = 'sendTransaction';
        const embedded = isEmbeddedActionOptions(options);

        if (!this.connected && embedded) {
            return this.initiateEmbeddedRequestFlow(
                { method: 'sendTransaction', request: tx },
                kind,
                { ...options, traceId }
            );
        }

        if (!this.connected) {
            this.tracker.trackTransactionSigningFailed(this.wallet, tx, 'Wallet was not connected');
            throw new TonConnectUIError('Connect wallet to send a transaction.');
        }

        const result = await this.initiateBridgeFlow(handlers, kind, { ...options, traceId });
        if (embedded) {
            return { hasResponse: true, response: result, traceId };
        }
        return result;
    }

    /**
     * Signs the data and returns the signature.
     *
     * Pass `options.enableEmbeddedRequest: true` to allow the request to ride along with the
     * connect URL on mobile, eliminating a round-trip. With that flag, the result is always the
     * embedded shape:
     *
     * - `{ hasResponse: true, response }` — the data was signed, either folded into connect by an
     *   embedded-request-capable wallet, or via the normal bridge flow.
     * - `{ hasResponse: false, connectResult: { dispatched } }` — the wallet connected but did not
     *   return a signature. Recovery is the dApp's responsibility:
     *     - `dispatched: false` — the request never reached the wallet.
     *     - `dispatched: true` — **the request was delivered to the wallet inside the connect
     *       URL.** The wallet may have already signed it; you just didn't get the response back.
     *       **Do not retry silently.** Surface an explicit retry button to the user, and, where it
     *       makes sense, verify that you don't already have the signature you need before
     *       re-submitting.
     *
     * Without the flag the method throws if the wallet is not connected and returns the plain
     * `SignDataResponse` otherwise.
     *
     * @param data data to sign.
     * @param options modal and notifications behaviour settings; set `enableEmbeddedRequest: true`
     * to opt into the connect-and-sign flow described above.
     * @returns Promise that resolves to the sign-data response including the signature.
     * @throws {@link TonConnectUIError} when no wallet is connected and `options.onConnected` is not provided.
     * @throws {@link TonConnectUIError} when the user cancels the signing in the modal.
     * @throws {@link TonConnectError} subclasses raised by the underlying SDK call (e.g. `WalletNotSupportFeatureError`, `UserRejectsError`, `BadRequestError`) are propagated unchanged.
     */
    public async signData(
        data: SignDataPayload,
        options?: ActionOptions
    ): Promise<OptionalTraceable<SignDataResponse>>;
    public async signData(
        data: SignDataPayload,
        options?: EmbeddedActionOptions
    ): Promise<OptionalTraceable<EmbeddedSignDataResponse>>;
    public async signData(
        data: SignDataPayload,
        options?: ActionOptions | EmbeddedActionOptions
    ): Promise<OptionalTraceable<SignDataResponse> | OptionalTraceable<EmbeddedSignDataResponse>> {
        const traceId = options?.traceId ?? UUIDv7();

        this.tracker.trackDataSentForSignature(this.wallet, data);

        const handlers = {
            onAbort: () => {
                this.tracker.trackDataSigningFailed(this.wallet, data, 'SignData was cancelled');
                return new TonConnectUIError('SignData was not sent');
            },
            sendRequestBuilder: options => async () => {
                const result = await this.connector.signData(data, options);
                this.tracker.trackDataSigned(this.wallet, data, result);
                return result;
            }
        } satisfies BridgeFlowHandlers<SignDataResponse>;

        const kind: ActionKind = 'signData';
        const embedded = isEmbeddedActionOptions(options);

        if (!this.connected && embedded) {
            return this.initiateEmbeddedRequestFlow({ method: 'signData', request: data }, kind, {
                ...options,
                traceId
            });
        }

        if (!this.connected) {
            this.tracker.trackDataSigningFailed(this.wallet, data, 'Wallet was not connected');
            throw new TonConnectUIError('Connect wallet to sign data.');
        }

        const result = await this.initiateBridgeFlow(handlers, kind, { ...options, traceId });
        if (embedded) {
            return { hasResponse: true, response: result, traceId };
        }
        return result;
    }

    /**
     * Signs a message built from a transaction request and returns the signed internal message BoC.
     *
     * Pass `options.enableEmbeddedRequest: true` to allow the request to ride along with the
     * connect URL on mobile, eliminating a round-trip. With that flag, the result is always the
     * embedded shape:
     *
     * - `{ hasResponse: true, response }` — the message was signed, either folded into connect by
     *   an embedded-request-capable wallet, or via the normal bridge flow.
     * - `{ hasResponse: false, connectResult: { dispatched } }` — the wallet connected but did not
     *   return a signed message. Recovery is the dApp's responsibility:
     *     - `dispatched: false` — the request never reached the wallet. Calling `signMessage(msg)`
     *       again (over the bridge) is safe.
     *     - `dispatched: true` — **the request was delivered to the wallet inside the connect
     *       URL.** The wallet may have already signed (and, for gasless flows, even submitted) it;
     *       you just didn't get the BoC back. **Do not retry silently.** Surface an explicit retry
     *       button to the user, and for transfer-style payloads check on-chain (the destination
     *       and amount in recent transaction history) before re-submitting to avoid a double
     *       send.
     *
     * Without the flag the method throws if the wallet is not connected and returns the plain
     * `SignMessageResponse` otherwise.
     *
     * @param message transaction-like request describing the internal message to sign.
     * @param options modal and notifications behaviour settings; set `enableEmbeddedRequest: true`
     * to opt into the connect-and-sign flow described above.
     * @returns Promise that resolves to the sign-message response including the signed BoC.
     * @throws {@link TonConnectUIError} when no wallet is connected and `options.onConnected` is not provided.
     * @throws {@link TonConnectUIError} when the user cancels the signing in the modal.
     * @throws {@link TonConnectError} subclasses raised by the underlying SDK call are propagated unchanged.
     */
    public async signMessage(
        message: SignMessageRequest,
        options?: ActionOptions
    ): Promise<OptionalTraceable<SignMessageResponse>>;
    public async signMessage(
        message: SignMessageRequest,
        options?: EmbeddedActionOptions
    ): Promise<OptionalTraceable<EmbeddedSignMessageResponse>>;
    public async signMessage(
        message: SignMessageRequest,
        options?: ActionOptions | EmbeddedActionOptions
    ): Promise<
        OptionalTraceable<SignMessageResponse> | OptionalTraceable<EmbeddedSignMessageResponse>
    > {
        const traceId = options?.traceId ?? UUIDv7();

        const handlers = {
            onAbort: () => {
                return new TonConnectUIError('SignMessage was not sent');
            },
            sendRequestBuilder: options => async () => {
                return await this.connector.signMessage(message, options);
            }
        } satisfies BridgeFlowHandlers<SignMessageResponse>;

        const kind: ActionKind = 'signMessage';
        const embedded = isEmbeddedActionOptions(options);

        if (!this.connected && embedded) {
            return this.initiateEmbeddedRequestFlow(
                { method: 'signMessage', request: message },
                kind,
                { ...options, traceId }
            );
        }

        if (!this.connected) {
            throw new TonConnectUIError('Connect wallet to sign a message.');
        }

        const result = await this.initiateBridgeFlow(handlers, kind, { ...options, traceId });
        if (embedded) {
            return { hasResponse: true, response: result, traceId };
        }
        return result;
    }

    /**
     * Gets the current session ID if available.
     * @returns session ID string or null if not available.
     */
    private async getSessionId(): Promise<string | null> {
        try {
            // Try to get session ID from storage as a fallback
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const storage = (this.connector as any).dappSettings?.storage;
            if (storage) {
                const stored = await storage.getItem('ton-connect-storage_bridge-connection');

                if (stored) {
                    const connection = JSON.parse(stored);

                    if (connection.type === 'http' && connection.sessionCrypto) {
                        // For pending connections
                        const sessionCrypto = new SessionCrypto(connection.sessionCrypto);
                        const sessionId = sessionCrypto.sessionId;
                        return sessionId;
                    } else if (connection.type === 'http' && connection.session?.sessionKeyPair) {
                        // For established connections
                        const sessionCrypto = new SessionCrypto(connection.session.sessionKeyPair);
                        const sessionId = sessionCrypto.sessionId;
                        return sessionId;
                    }
                }
            }
        } catch (e) {
            // Ignore errors, sessionId will remain null
        }

        return null;
    }

    private redirectAfterRequestSent({
        returnStrategy,
        twaReturnUrl,
        forceRedirect,
        sessionId,
        traceId
    }: Traceable<{
        returnStrategy: ReturnStrategy;
        twaReturnUrl?: `${string}://${string}`;
        forceRedirect?: boolean;
        sessionId?: string;
    }>): void {
        if (
            this.walletInfo &&
            'universalLink' in this.walletInfo &&
            (this.walletInfo.openMethod === 'universal-link' ||
                this.walletInfo.openMethod === 'custom-deeplink')
        ) {
            const linkWithSessionId = enrichUniversalLink(this.walletInfo.universalLink, {
                sessionId,
                traceId
            });

            if (isTelegramUrl(this.walletInfo.universalLink)) {
                redirectToTelegram(linkWithSessionId, {
                    returnStrategy,
                    twaReturnUrl: twaReturnUrl || appState.twaReturnUrl,
                    forceRedirect: forceRedirect || false
                });
            } else {
                redirectToWallet(
                    linkWithSessionId,
                    this.walletInfo.deepLink,
                    {
                        returnStrategy,
                        forceRedirect: forceRedirect || false
                    },
                    () => {}
                );
            }
        }
    }

    /**
     * TODO: remove in the next major version.
     * Initiates a connection with an embedded wallet, awaits its completion, and returns the connected wallet information.
     * @param embeddedWallet - Information about the embedded wallet to connect to.
     * @throws Error if the connection process fails.
     * @internal
     */
    private async connectEmbeddedWallet(
        embeddedWallet: WalletInfoCurrentlyEmbedded,
        options: Traceable
    ): Promise<ConnectedWallet> {
        const connect = (parameters?: ConnectAdditionalRequest): void => {
            setLastSelectedWalletInfo(embeddedWallet);
            this.connector.connect({ jsBridgeKey: embeddedWallet.jsBridgeKey }, parameters, {
                traceId: options.traceId
            });
        };

        const additionalRequest = appState.connectRequestParameters;
        if (additionalRequest?.state === 'loading') {
            this.connectRequestParametersCallback = connect;
        } else {
            connect(additionalRequest?.value);
        }

        return await this.waitForWalletConnection({
            ignoreErrors: false,
            traceId: options.traceId
        });
    }

    /**
     * TODO: remove in the next major version.
     * Initiates the connection process for an external wallet by opening the wallet modal
     * and returns the connected wallet information upon successful connection.
     * @throws Error if the user cancels the connection process or if the connection process fails.
     * @internal
     */
    private async connectExternalWallet(options: Traceable): Promise<ConnectedWallet> {
        const abortController = new AbortController();

        widgetController.openWalletsModal({ traceId: options.traceId });

        const unsubscribe = this.onModalStateChange(state => {
            const { status, closeReason } = state;
            if (status === 'opened') {
                return;
            }

            unsubscribe();
            if (closeReason === 'action-cancelled') {
                abortController.abort();
            }
        });

        return await this.waitForWalletConnection({
            ignoreErrors: true,
            signal: abortController.signal,
            traceId: options.traceId
        });
    }

    /**
     * TODO: remove in the next major version.
     * Waits for a wallet connection based on provided options, returning connected wallet information.
     * @param options - Configuration for connection statuses and errors handling.
     * @options.ignoreErrors - If true, ignores errors during waiting, waiting continues until a valid wallet connects. Default is false.
     * @options.abortSignal - Optional AbortSignal for external cancellation. Throws TonConnectUIError if aborted.
     * @throws TonConnectUIError if waiting is aborted or no valid wallet connection is received and ignoreErrors is false.
     * @internal
     */
    private async waitForWalletConnection(
        options: WaitWalletConnectionOptions
    ): Promise<ConnectedWallet> {
        return new Promise((resolve, reject) => {
            this.tracker.trackConnectionStarted();
            const { ignoreErrors = false, signal = null } = options;

            if (signal && signal.aborted) {
                this.tracker.trackConnectionError('Connection was cancelled');
                return reject(new TonConnectUIError('Wallet was not connected'));
            }

            const onStatusChangeHandler = async (wallet: ConnectedWallet | null): Promise<void> => {
                if (!wallet) {
                    this.tracker.trackConnectionError('Connection was cancelled');

                    if (ignoreErrors) {
                        // skip empty wallet status changes to avoid aborting the process
                        return;
                    }

                    unsubscribe();
                    reject(new TonConnectUIError('Wallet was not connected'));
                } else {
                    this.tracker.trackConnectionCompleted(wallet);

                    unsubscribe();
                    resolve(wallet);
                }
            };

            const onErrorsHandler = (reason: TonConnectError): void => {
                this.tracker.trackConnectionError(reason.message);

                if (ignoreErrors) {
                    // skip errors to avoid aborting the process
                    return;
                }

                unsubscribe();
                reject(reason);
            };

            const unsubscribe = this.onStatusChange(
                (wallet: ConnectedWallet | null) => onStatusChangeHandler(wallet),
                (reason: TonConnectError) => onErrorsHandler(reason)
            );

            if (signal) {
                signal.addEventListener(
                    'abort',
                    (): void => {
                        unsubscribe();
                        reject(new TonConnectUIError('Wallet was not connected'));
                    },
                    { once: true }
                );
            }
        });
    }

    private async initiateEmbeddedRequestFlow<TResponse>(
        embeddedRequest: EmbeddedRequest,
        kind: ActionKind,
        options: PickRequired<ActionOptions, 'traceId'>
    ): Promise<OptionalTraceable<EmbeddedTResponse<TResponse>>> {
        const consumable = new Consumable(embeddedRequest);

        const abortController = new AbortController();

        await this.modalManager.open({
            traceId: options.traceId,
            embeddedRequest: consumable
        });

        const unsubscribe = this.onModalStateChange(state => {
            if (state.status === 'opened') {
                return;
            }

            unsubscribe();
            if (state.closeReason === 'action-cancelled') {
                abortController.abort();
            }
        });

        const connectedWallet = await this.waitForWalletConnection({
            ignoreErrors: true,
            signal: abortController.signal,
            traceId: options.traceId
        });

        const response = connectedWallet.embeddedResponse;
        if (response) {
            const { notifications, modals } = this.getModalsAndNotificationsConfiguration(options);

            if (!response.ok) {
                widgetController.setAction({
                    name: errorActionNames[kind],
                    showNotification: notifications.includes('error'),
                    openModal: modals.includes('error'),
                    traceId: options.traceId
                });

                throw new TonConnectUIError(
                    response.error.message || 'Wallet rejected the embedded request'
                );
            }

            widgetController.setAction({
                name: successActionNames[kind],
                showNotification: notifications.includes('success'),
                openModal: modals.includes('success'),
                traceId: options.traceId
            });

            return {
                hasResponse: true,
                response: response.result as TResponse,
                traceId: options.traceId
            };
        }

        const dispatched = consumable.consumed;
        return {
            hasResponse: false,
            connectResult: {
                dispatched
            },
            traceId: options.traceId
        };
    }

    private async initiateBridgeFlow<TResponse>(
        handlers: BridgeFlowHandlers<TResponse>,
        kind: ActionKind,
        options: Traceable<ActionOptions>
    ): Promise<TResponse> {
        if (isInTMA()) {
            sendExpand();
        }

        const { notifications, modals, returnStrategy, twaReturnUrl } =
            this.getModalsAndNotificationsConfiguration(options);

        const sessionId = await this.getSessionId();

        widgetController.setAction({
            name: confirmActionNames[kind],
            showNotification: notifications.includes('before'),
            openModal: modals.includes('before'),
            executed: false,
            sessionId: sessionId || undefined,
            traceId: options.traceId,
            returnStrategy,
            twaReturnUrl
        });

        const abortController = new AbortController();

        const onRequestSent = (): void => {
            if (abortController.signal.aborted) {
                return;
            }

            widgetController.setAction({
                name: confirmActionNames[kind],
                showNotification: notifications.includes('before'),
                openModal: modals.includes('before'),
                executed: true,
                sessionId: sessionId || undefined,
                traceId: options.traceId,
                returnStrategy,
                twaReturnUrl
            });

            this.redirectAfterRequestSent({
                returnStrategy,
                twaReturnUrl,
                sessionId: sessionId || undefined,
                traceId: options.traceId
            });

            let firstClick = true;
            const redirectToWallet = async () => {
                if (abortController.signal.aborted) {
                    return;
                }

                const forceRedirect = !firstClick;
                firstClick = false;

                await this.redirectAfterRequestSent({
                    returnStrategy,
                    twaReturnUrl,
                    forceRedirect,
                    sessionId: sessionId || undefined,
                    traceId: options.traceId
                });
            };

            options?.onRequestSent?.(redirectToWallet);
        };

        const unsubscribe = this.onTransactionModalStateChange(action => {
            if (action?.openModal) {
                return;
            }

            unsubscribe();
            if (!action) {
                abortController.abort();
            }
        });

        try {
            const result = await this.runConnectorRequestWithAbortHandling(
                abortController.signal,
                handlers.onAbort,
                handlers.sendRequestBuilder({
                    onRequestSent,
                    signal: abortController.signal,
                    traceId: options.traceId
                })
            );

            widgetController.setAction({
                name: successActionNames[kind],
                showNotification: notifications.includes('success'),
                openModal: modals.includes('success'),
                traceId: options.traceId
            });

            return result;
        } catch (e) {
            if (e instanceof WalletNotSupportFeatureError) {
                widgetController.clearAction();
                widgetController.openWalletNotSupportFeatureModal(e.cause, {
                    traceId: options.traceId
                });

                throw e;
            }

            widgetController.setAction({
                name: errorActionNames[kind],
                showNotification: notifications.includes('error'),
                openModal: modals.includes('error'),
                traceId: options.traceId
            });

            if (e instanceof TonConnectError) {
                throw e;
            } else {
                console.error(e);
                throw new TonConnectUIError('Unhandled error:' + e);
            }
        } finally {
            unsubscribe();
        }
    }

    private async runConnectorRequestWithAbortHandling<T>(
        signal: AbortSignal,
        onAborted: () => TonConnectUIError,
        call: () => Promise<T>
    ): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (signal.aborted) {
                return reject(onAborted());
            }

            const onCanceledHandler = (): void => {
                reject(onAborted());
            };

            signal.addEventListener('abort', onCanceledHandler, { once: true });

            call()
                .then(result => {
                    signal.removeEventListener('abort', onCanceledHandler);
                    resolve(result);
                })
                .catch(reason => {
                    signal.removeEventListener('abort', onCanceledHandler);
                    reject(reason);
                });
        });
    }

    /**
     * Subscribe to the transaction modal window state changes, returns a function which has to be called to unsubscribe.
     * @internal
     */
    private onTransactionModalStateChange(onChange: (action: Action | null) => void): () => void {
        return this.transactionModal.onStateChange(onChange);
    }

    private subscribeToWalletChange(): void {
        // TODO: possible memory leak here, check it
        this.connector.onStatusChange(async wallet => {
            if (wallet) {
                await this.updateWalletInfo(wallet);
                this.setPreferredWalletAppName(this.walletInfo?.appName || wallet.device.appName);
            } else {
                this.walletInfoStorage.removeWalletInfo();
            }
        });
    }

    private setPreferredWalletAppName(value: string): void {
        this.preferredWalletStorage.setPreferredWalletAppName(value);
        setAppState({ preferredWalletAppName: value });
    }

    private async getSelectedWalletInfo(wallet: Wallet): Promise<WalletInfoWithOpenMethod | null> {
        let lastSelectedWalletInfo = widgetController.getSelectedWalletInfo();

        if (!lastSelectedWalletInfo) {
            return null;
        }

        if (!('name' in lastSelectedWalletInfo)) {
            if (wallet.device.appName === WALLET_CONNECT_APP_NAME) {
                return {
                    type: 'wallet-connect',
                    name: WALLET_CONNECT_WALLET_NAME,
                    appName: WALLET_CONNECT_APP_NAME,
                    imageUrl: IMG.WALLET_CONNECT,
                    aboutUrl: WALLET_CONNECT_ABOUT_URL,
                    features: wallet.device.features,
                    platforms: []
                };
            }

            const walletsList = applyWalletsListConfiguration(
                await this.walletsList,
                appState.walletsListConfiguration
            );
            const walletInfo = walletsList.find(item => eqWalletName(item, wallet.device.appName));

            if (!walletInfo) {
                throw new TonConnectUIError(
                    `Cannot find WalletInfo for the '${wallet.device.appName}' wallet`
                );
            }

            return {
                ...walletInfo,
                ...lastSelectedWalletInfo
            };
        }

        return lastSelectedWalletInfo;
    }

    private async updateWalletInfo(wallet: Wallet): Promise<void> {
        const selectedWalletInfo = await this.getSelectedWalletInfo(wallet);
        if (selectedWalletInfo) {
            this.walletInfo = selectedWalletInfo;
            this.walletInfoStorage.setWalletInfo(selectedWalletInfo);
            return;
        }

        const storedWalletInfo = this.walletInfoStorage.getWalletInfo();
        if (storedWalletInfo) {
            this.walletInfo = storedWalletInfo;
            return;
        }

        this.walletInfo =
            (await this.walletsList).find(walletInfo =>
                eqWalletName(walletInfo, wallet.device.appName)
            ) || null;
    }

    private normalizeWidgetRoot(rootId: string | undefined): string {
        if (!rootId || !document.getElementById(rootId)) {
            rootId = 'tc-widget-root';
            const rootElement = document.createElement('div');
            rootElement.id = rootId;
            document.body.appendChild(rootElement);
        }

        return rootId;
    }

    private checkButtonRootExist(buttonRootId: string | null | undefined): void | never {
        if (buttonRootId == null) {
            return;
        }

        if (!document.getElementById(buttonRootId)) {
            throw new TonConnectUIError(`${buttonRootId} element not found in the document.`);
        }
    }

    // eslint-disable-next-line complexity
    private getModalsAndNotificationsConfiguration(
        options?: ActionConfiguration
    ): StrictActionConfiguration {
        const allActions: StrictActionConfiguration['notifications'] = [
            'before',
            'success',
            'error'
        ];

        let notifications: StrictActionConfiguration['notifications'] = allActions;
        if (
            this.actionsConfiguration?.notifications &&
            this.actionsConfiguration?.notifications !== 'all'
        ) {
            notifications = this.actionsConfiguration.notifications;
        }

        if (options?.notifications) {
            if (options.notifications === 'all') {
                notifications = allActions;
            } else {
                notifications = options.notifications;
            }
        }

        let modals: StrictActionConfiguration['modals'] = ['before'];
        if (this.actionsConfiguration?.modals) {
            if (this.actionsConfiguration.modals === 'all') {
                modals = allActions;
            } else {
                modals = this.actionsConfiguration.modals;
            }
        }
        if (options?.modals) {
            if (options.modals === 'all') {
                modals = allActions;
            } else {
                modals = options.modals;
            }
        }

        const returnStrategy =
            options?.returnStrategy || this.actionsConfiguration?.returnStrategy || 'back';

        const twaReturnUrl = options?.twaReturnUrl || this.actionsConfiguration?.twaReturnUrl;

        let skipRedirectToWallet =
            options?.skipRedirectToWallet ||
            this.actionsConfiguration?.skipRedirectToWallet ||
            'ios';

        // TODO: refactor this check after testing
        if (isInTMA()) {
            skipRedirectToWallet = 'never';
        }

        return {
            notifications,
            modals,
            returnStrategy,
            twaReturnUrl,
            skipRedirectToWallet
        };
    }
}

type ActionOptions = ActionConfiguration &
    OptionalTraceable<{
        onRequestSent?: (redirectToWallet: () => void) => void;
    }>;

type EnableEmbeddedRequest = {
    enableEmbeddedRequest: true;
};

type EmbeddedActionOptions = ActionOptions & EnableEmbeddedRequest;

function isEmbeddedActionOptions(
    options: ActionOptions | EmbeddedActionOptions | undefined
): options is EmbeddedActionOptions {
    return (
        typeof options === 'object' &&
        options !== null &&
        'enableEmbeddedRequest' in options &&
        options.enableEmbeddedRequest === true
    );
}

type BridgeFlowHandlers<TResponse> = {
    onAbort: () => TonConnectUIError;
    sendRequestBuilder: (
        options: OptionalTraceable<{ onRequestSent?: () => void; signal?: AbortSignal }>
    ) => () => Promise<TResponse>;
};

type WaitWalletConnectionOptions = Traceable<{
    ignoreErrors?: boolean;
    signal?: AbortSignal | null;
}>;

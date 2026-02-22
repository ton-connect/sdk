import {
    Account,
    BrowserEventDispatcher,
    checkRequiredWalletFeatures,
    ConnectAdditionalRequest,
    OptionalTraceable,
    RequiredFeatures,
    SignDataPayload,
    SignDataResponse,
    Traceable,
    UUIDv7,
    WalletInfoCurrentlyEmbedded
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
import { Action, setLastSelectedWalletInfo } from 'src/app/state/modals-state';
import { ActionConfiguration, StrictActionConfiguration } from 'src/models/action-configuration';
import { ConnectedWallet, WalletInfoWithOpenMethod } from 'src/models/connected-wallet';
import { applyWalletsListConfiguration, eqWalletName } from 'src/app/utils/wallets';
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
import { uniq } from 'src/app/utils/array';
import { AT_WALLET_APP_NAME } from 'src/app/env/AT_WALLET_APP_NAME';
import { logError } from 'src/app/utils/log';

export class TonConnectUI {
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

    public get walletsRequiredFeatures(): RequiredFeatures | undefined {
        return this._walletsRequiredFeatures;
    }

    private _walletsPreferredFeatures?: RequiredFeatures;

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
     * Promise that resolves after end of th connection restoring process (promise will fire after `onStatusChange`,
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
     * Curren connected wallet app and its info or null.
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
     * Set and apply new UI options. Object with partial options should be passed. Passed options will be merged with current options.
     * @param options
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

        this.modal = new WalletsModalManager({
            connector: this.connector,
            tracker: this.tracker,
            setConnectRequestParametersCallback: (
                callback: (parameters?: ConnectAdditionalRequest) => void
            ) => {
                this.connectRequestParametersCallback = callback;
            }
        });

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

        this.preloadImages();

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
     * You can call it multiply times to set updated tonProof payload if previous one is outdated.
     * If `connectRequestParameters.state === 'loading'` loader will appear instead of the qr code in the wallets modal.
     * If `connectRequestParameters.state` was changed to 'ready' or it's value has been changed, QR will be re-rendered.
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
     * If wallet connects with a different chain, the SDK will throw an error and abort connection.
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
     * Subscribe to connection status change.
     * @return function which has to be called to unsubscribe.
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
     * @return Connected wallet.
     * @throws TonConnectUIError if connection was aborted.
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
     * Disconnect wallet and clean localstorage.
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
     * @param tx transaction to send.
     * @param options modal and notifications behaviour settings. Default is show only 'before' modal and all notifications.
     */
    public async sendTransaction(
        tx: SendTransactionRequest,
        options?: ActionConfiguration &
            OptionalTraceable<{
                onRequestSent?: (redirectToWallet: () => void) => void;
            }>
    ): Promise<OptionalTraceable<SendTransactionResponse>> {
        const traceId = options?.traceId ?? UUIDv7();

        this.tracker.trackTransactionSentForSignature(this.wallet, tx);

        if (!this.connected) {
            this.tracker.trackTransactionSigningFailed(this.wallet, tx, 'Wallet was not connected');
            throw new TonConnectUIError('Connect wallet to send a transaction.');
        }

        if (isInTMA()) {
            sendExpand();
        }

        const { notifications, modals, returnStrategy, twaReturnUrl } =
            this.getModalsAndNotificationsConfiguration(options);

        const sessionId = await this.getSessionId();

        widgetController.setAction({
            name: 'confirm-transaction',
            showNotification: notifications.includes('before'),
            openModal: modals.includes('before'),
            sent: false,
            sessionId: sessionId || undefined,
            traceId
        });

        const abortController = new AbortController();

        const onRequestSent = (): void => {
            if (abortController.signal.aborted) {
                return;
            }

            widgetController.setAction({
                name: 'confirm-transaction',
                showNotification: notifications.includes('before'),
                openModal: modals.includes('before'),
                sent: true,
                sessionId: sessionId || undefined,
                traceId
            });

            this.redirectAfterRequestSent({
                returnStrategy,
                twaReturnUrl,
                sessionId: sessionId || undefined,
                traceId
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
                    traceId
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
            const result = await this.waitForSendTransaction(
                {
                    transaction: tx,
                    signal: abortController.signal,
                    traceId
                },
                onRequestSent
            );

            this.tracker.trackTransactionSigned(this.wallet, tx, result);

            widgetController.setAction({
                name: 'transaction-sent',
                showNotification: notifications.includes('success'),
                openModal: modals.includes('success'),
                traceId
            });

            return result;
        } catch (e) {
            if (e instanceof WalletNotSupportFeatureError) {
                widgetController.clearAction();
                widgetController.openWalletNotSupportFeatureModal(e.cause, { traceId });

                throw e;
            }

            widgetController.setAction({
                name: 'transaction-canceled',
                showNotification: notifications.includes('error'),
                openModal: modals.includes('error'),
                traceId
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

    /**
     * Signs the data and returns the signature.
     * @param data data to sign.
     */
    public async signData(
        data: SignDataPayload,
        options?: OptionalTraceable<{ onRequestSent?: (redirectToWallet: () => void) => void }>
    ): Promise<SignDataResponse> {
        const traceId = options?.traceId ?? UUIDv7();

        this.tracker.trackDataSentForSignature(this.wallet, data);

        if (!this.connected) {
            this.tracker.trackDataSigningFailed(this.wallet, data, 'Wallet was not connected');
            throw new TonConnectUIError('Connect wallet to send a transaction.');
        }

        if (isInTMA()) {
            sendExpand();
        }

        const { notifications, modals, returnStrategy, twaReturnUrl } =
            this.getModalsAndNotificationsConfiguration();

        const sessionId = await this.getSessionId();

        widgetController.setAction({
            name: 'confirm-sign-data',
            showNotification: notifications.includes('before'),
            openModal: modals.includes('before'),
            signed: false,
            sessionId: sessionId || undefined,
            traceId
        });

        const abortController = new AbortController();

        const onRequestSent = (): void => {
            if (abortController.signal.aborted) {
                return;
            }

            widgetController.setAction({
                name: 'confirm-sign-data',
                showNotification: notifications.includes('before'),
                openModal: modals.includes('before'),
                signed: true,
                sessionId: sessionId || undefined,
                traceId
            });

            this.redirectAfterRequestSent({
                returnStrategy,
                twaReturnUrl,
                sessionId: sessionId || undefined,
                traceId
            });

            let firstClick = true;
            const redirectToWallet = () => {
                if (abortController.signal.aborted) {
                    return;
                }

                const forceRedirect = !firstClick;
                firstClick = false;

                this.redirectAfterRequestSent({
                    returnStrategy,
                    twaReturnUrl,
                    forceRedirect,
                    sessionId: sessionId || undefined,
                    traceId
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
            const result = await this.waitForSignData(
                {
                    data,
                    signal: new AbortController().signal,
                    traceId
                },
                onRequestSent
            );

            this.tracker.trackDataSigned(this.wallet, data, result);

            widgetController.setAction({
                name: 'data-signed',
                showNotification: notifications.includes('success'),
                openModal: modals.includes('success'),
                traceId
            });

            return result;
        } catch (e) {
            if (e instanceof WalletNotSupportFeatureError) {
                widgetController.clearAction();
                widgetController.openWalletNotSupportFeatureModal(e.cause, { traceId });

                throw e;
            }

            widgetController.setAction({
                name: 'sign-data-canceled',
                showNotification: notifications.includes('error'),
                openModal: modals.includes('error'),
                traceId
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

    /**
     * Waits for a transaction to be sent based on provided options, returning the transaction response.
     * @param options - Configuration for transaction statuses and errors handling.
     * @options.transaction - Transaction to send.
     * @options.ignoreErrors - If true, ignores errors during waiting, waiting continues until a valid transaction is sent. Default is false.
     * @options.abortSignal - Optional AbortSignal for external cancellation. Throws TonConnectUIError if aborted.
     * @param onRequestSent (optional) will be called after the transaction is sent to the wallet.
     * @throws TonConnectUIError if waiting is aborted or no valid transaction response is received and ignoreErrors is false.
     * @internal
     */
    private async waitForSendTransaction(
        options: WaitSendTransactionOptions,
        onRequestSent?: () => void
    ): Promise<OptionalTraceable<SendTransactionResponse>> {
        return new Promise((resolve, reject) => {
            const { transaction, signal } = options;

            if (signal.aborted) {
                this.tracker.trackTransactionSigningFailed(
                    this.wallet,
                    transaction,
                    'Transaction was cancelled'
                );
                return reject(new TonConnectUIError('Transaction was not sent'));
            }

            const onTransactionHandler = async (
                transaction: OptionalTraceable<SendTransactionResponse>
            ): Promise<void> => {
                resolve(transaction);
            };

            const onErrorsHandler = (reason: TonConnectError): void => {
                reject(reason);
            };

            const onCanceledHandler = (): void => {
                this.tracker.trackTransactionSigningFailed(
                    this.wallet,
                    transaction,
                    'Transaction was cancelled'
                );
                reject(new TonConnectUIError('Transaction was not sent'));
            };

            signal.addEventListener('abort', onCanceledHandler, { once: true });

            this.connector
                .sendTransaction(transaction, {
                    onRequestSent: onRequestSent,
                    signal: signal,
                    traceId: options.traceId
                })
                .then(result => {
                    signal.removeEventListener('abort', onCanceledHandler);
                    return onTransactionHandler(result);
                })
                .catch(reason => {
                    signal.removeEventListener('abort', onCanceledHandler);
                    return onErrorsHandler(reason);
                });
        });
    }

    /**
     * Waits for a transaction to be sent based on provided options, returning the transaction response.
     * @param options - Configuration for transaction statuses and errors handling.
     * @options.transaction - Transaction to send.
     * @options.ignoreErrors - If true, ignores errors during waiting, waiting continues until a valid transaction is sent. Default is false.
     * @options.abortSignal - Optional AbortSignal for external cancellation. Throws TonConnectUIError if aborted.
     * @param onRequestSent (optional) will be called after the transaction is sent to the wallet.
     * @throws TonConnectUIError if waiting is aborted or no valid transaction response is received and ignoreErrors is false.
     * @internal
     */
    private async waitForSignData(
        options: WaitSignDataOptions,
        onRequestSent?: () => void
    ): Promise<SignDataResponse> {
        return new Promise((resolve, reject) => {
            const { data, signal } = options;

            if (signal.aborted) {
                this.tracker.trackDataSigningFailed(this.wallet, data, 'SignData was cancelled');
                return reject(new TonConnectUIError('SignData was not sent'));
            }

            const onSignHandler = async (data: SignDataResponse): Promise<void> => {
                resolve(data);
            };

            const onErrorsHandler = (reason: TonConnectError): void => {
                reject(reason);
            };

            const onCanceledHandler = (): void => {
                this.tracker.trackDataSigningFailed(this.wallet, data, 'SignData was cancelled');
                reject(new TonConnectUIError('SignData was not sent'));
            };

            signal.addEventListener('abort', onCanceledHandler, { once: true });

            this.connector
                .signData(data, { onRequestSent: onRequestSent, signal: signal })
                .then(result => {
                    // signal.removeEventListener('abort', onCanceledHandler);
                    return onSignHandler(result);
                })
                .catch(reason => {
                    // signal.removeEventListener('abort', onCanceledHandler);
                    return onErrorsHandler(reason);
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

    private preloadImages() {
        this.walletsList
            .then(wallets => {
                const preferredName = this.preferredWalletStorage.getPreferredWalletAppName();
                const preferredWallet = preferredName
                    ? wallets.find(w => w.appName === preferredName)
                    : undefined;

                const atWallet = wallets.find(w => w.appName === AT_WALLET_APP_NAME);

                const candidateWallets = [preferredWallet, atWallet, ...wallets.slice(0, 3)].filter(
                    wallet => wallet !== undefined
                );

                const requiredFeatures = this.walletsRequiredFeatures;

                const walletsToPreload = candidateWallets.filter(
                    wallet =>
                        !requiredFeatures ||
                        checkRequiredWalletFeatures(wallet.features ?? [], requiredFeatures)
                );

                const imagesToPreload = uniq([
                    IMG.TON,
                    IMG.TG,
                    ...walletsToPreload.map(w => w.imageUrl)
                ]);

                preloadImages(imagesToPreload);
            })
            .catch(logError);
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

type WaitWalletConnectionOptions = Traceable<{
    ignoreErrors?: boolean;
    signal?: AbortSignal | null;
}>;

type WaitSendTransactionOptions = Traceable<{
    transaction: SendTransactionRequest;
    signal: AbortSignal;
}>;

type WaitSignDataOptions = Traceable<{
    data: SignDataPayload;
    signal: AbortSignal;
}>;

import type {
    Account,
    ConnectAdditionalRequest,
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
    WalletInfo
} from '@tonconnect/sdk';
import { widgetController } from 'src/app/widget-controller';
import { TonConnectUIError } from 'src/errors/ton-connect-ui.error';
import { TonConnectUiCreateOptions } from 'src/models/ton-connect-ui-create-options';
import { PreferredWalletStorage, WalletInfoStorage } from 'src/storage';
import {
    getSystemTheme,
    getUserAgent,
    openLinkBlank,
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
import { uniq } from 'src/app/utils/array';
import { Loadable } from 'src/models/loadable';
import { WalletsModalManager } from 'src/managers/wallets-modal-manager';
import { TransactionModalManager } from 'src/managers/transaction-modal-manager';
import { WalletsModal, WalletsModalState } from 'src/models/wallets-modal';
import { isInTMA, sendExpand } from 'src/app/utils/tma-api';
import { addReturnStrategy, redirectToTelegram } from 'src/app/utils/url-strategy-helpers';
import { SingleWalletModalManager } from 'src/managers/single-wallet-modal-manager';
import { SingleWalletModal, SingleWalletModalState } from 'src/models/single-wallet-modal';

export class TonConnectUI {
    public static getWallets(): Promise<WalletInfo[]> {
        return TonConnect.getWallets();
    }

    private readonly walletInfoStorage = new WalletInfoStorage();

    private readonly preferredWalletStorage = new PreferredWalletStorage();

    private walletInfo: WalletInfoWithOpenMethod | null = null;

    private systemThemeChangeUnsubscribe: (() => void) | null = null;

    private actionsConfiguration?: ActionConfiguration;

    private readonly walletsList: Promise<WalletInfo[]>;

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
     * Promise that resolves after end of th connection restoring process (promise will fire after `onStatusChange`, so you can get actual information about wallet and session after when promise resolved).
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
        if (options && 'connector' in options && options.connector) {
            this.connector = options.connector;
        } else if (options && 'manifestUrl' in options && options.manifestUrl) {
            this.connector = new TonConnect({ manifestUrl: options.manifestUrl });
        } else {
            throw new TonConnectUIError(
                'You have to specify a `manifestUrl` or a `connector` in the options.'
            );
        }

        this.modal = new WalletsModalManager({
            connector: this.connector,
            setConnectRequestParametersCallback: (
                callback: (parameters?: ConnectAdditionalRequest) => void
            ) => {
                this.connectRequestParametersCallback = callback;
            }
        });

        this.singleWalletModal = new SingleWalletModalManager({
            connector: this.connector,
            setConnectRequestParametersCallback: (
                callback: (parameters?: ConnectAdditionalRequest) => void
            ) => {
                this.connectRequestParametersCallback = callback;
            }
        });

        this.transactionModal = new TransactionModalManager({
            connector: this.connector
        });

        this.walletsList = this.getWallets();

        this.walletsList.then(list => preloadImages(uniq(list.map(item => item.imageUrl))));

        const rootId = this.normalizeWidgetRoot(options?.widgetRootId);

        this.subscribeToWalletChange();

        if (options?.restoreConnection !== false) {
            this.connectionRestored = new Promise(async resolve => {
                await this.connector.restoreConnection();

                if (!this.connector.connected) {
                    this.walletInfoStorage.removeWalletInfo();
                }

                resolve(this.connector.connected);
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
    public async openModal(): Promise<void> {
        return this.modal.open();
    }

    /**
     * Closes the modal window.
     */
    public closeModal(): void {
        this.modal.close();
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
    public closeSingleWalletModal(): void {
        this.singleWalletModal.close();
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
    public async connectWallet(): Promise<ConnectedWallet> {
        const walletsList = await this.getWallets();
        const embeddedWallet = walletsList.find(isWalletInfoCurrentlyEmbedded);

        if (embeddedWallet) {
            return await this.connectEmbeddedWallet(embeddedWallet);
        } else {
            return await this.connectExternalWallet();
        }
    }

    /**
     * Disconnect wallet and clean localstorage.
     */
    public disconnect(): Promise<void> {
        widgetController.clearAction();
        widgetController.removeSelectedWalletInfo();
        this.walletInfoStorage.removeWalletInfo();
        return this.connector.disconnect();
    }

    /**
     * Opens the modal window and handles the transaction sending.
     * @param tx transaction to send.
     * @param options modal and notifications behaviour settings. Default is show only 'before' modal and all notifications.
     */
    public async sendTransaction(
        tx: SendTransactionRequest,
        options?: ActionConfiguration
    ): Promise<SendTransactionResponse> {
        if (!this.connected) {
            throw new TonConnectUIError('Connect wallet to send a transaction.');
        }

        if (isInTMA()) {
            sendExpand();
        }

        const { notifications, modals, returnStrategy, twaReturnUrl, skipRedirectToWallet } =
            this.getModalsAndNotificationsConfiguration(options);

        widgetController.setAction({
            name: 'confirm-transaction',
            showNotification: notifications.includes('before'),
            openModal: modals.includes('before')
        });

        const onRequestSent = (): void => {
            const userOSIsIos = getUserAgent().os === 'ios';
            const shouldSkipRedirectToWallet =
                (skipRedirectToWallet === 'ios' && userOSIsIos) ||
                skipRedirectToWallet === 'always';

            if (
                this.walletInfo &&
                'universalLink' in this.walletInfo &&
                this.walletInfo.openMethod === 'universal-link' &&
                !shouldSkipRedirectToWallet
            ) {
                if (isTelegramUrl(this.walletInfo.universalLink)) {
                    redirectToTelegram(this.walletInfo.universalLink, {
                        returnStrategy,
                        twaReturnUrl: twaReturnUrl || appState.twaReturnUrl,
                        forceRedirect: false
                    });
                } else {
                    openLinkBlank(addReturnStrategy(this.walletInfo.universalLink, returnStrategy));
                }
            }
        };

        const abortController = new AbortController();

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
                    abortSignal: abortController.signal
                },
                onRequestSent
            );

            widgetController.setAction({
                name: 'transaction-sent',
                showNotification: notifications.includes('success'),
                openModal: modals.includes('success')
            });

            return result;
        } catch (e) {
            widgetController.setAction({
                name: 'transaction-canceled',
                showNotification: notifications.includes('error'),
                openModal: modals.includes('error')
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
     * TODO: remove in the next major version.
     * Initiates a connection with an embedded wallet, awaits its completion, and returns the connected wallet information.
     * @param embeddedWallet - Information about the embedded wallet to connect to.
     * @throws Error if the connection process fails.
     * @internal
     */
    private async connectEmbeddedWallet(
        embeddedWallet: WalletInfoCurrentlyEmbedded
    ): Promise<ConnectedWallet> {
        const connect = (parameters?: ConnectAdditionalRequest): void => {
            setLastSelectedWalletInfo(embeddedWallet);
            this.connector.connect({ jsBridgeKey: embeddedWallet.jsBridgeKey }, parameters);
        };

        const additionalRequest = appState.connectRequestParameters;
        if (additionalRequest?.state === 'loading') {
            this.connectRequestParametersCallback = connect;
        } else {
            connect(additionalRequest?.value);
        }

        return await this.waitForWalletConnection({
            ignoreErrors: false
        });
    }

    /**
     * TODO: remove in the next major version.
     * Initiates the connection process for an external wallet by opening the wallet modal
     * and returns the connected wallet information upon successful connection.
     * @throws Error if the user cancels the connection process or if the connection process fails.
     * @internal
     */
    private async connectExternalWallet(): Promise<ConnectedWallet> {
        const abortController = new AbortController();

        widgetController.openWalletsModal();

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
            abortSignal: abortController.signal
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
            const { ignoreErrors = false, abortSignal = null } = options;

            if (abortSignal && abortSignal.aborted) {
                return reject(new TonConnectUIError('Wallet was not connected'));
            }

            const onStatusChangeHandler = async (wallet: ConnectedWallet | null): Promise<void> => {
                if (!wallet) {
                    if (ignoreErrors) {
                        // skip empty wallet status changes to avoid aborting the process
                        return;
                    }

                    unsubscribe();
                    reject(new TonConnectUIError('Wallet was not connected'));
                } else {
                    unsubscribe();
                    resolve(wallet);
                }
            };

            const onErrorsHandler = (reason: TonConnectError): void => {
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

            if (abortSignal) {
                abortSignal.addEventListener('abort', (): void => {
                    unsubscribe();
                    reject(new TonConnectUIError('Wallet was not connected'));
                });
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
    ): Promise<SendTransactionResponse> {
        return new Promise((resolve, reject) => {
            const { transaction, abortSignal } = options;

            if (abortSignal.aborted) {
                return reject(new TonConnectUIError('Transaction was not sent'));
            }

            const onTransactionHandler = async (
                transaction: SendTransactionResponse
            ): Promise<void> => {
                resolve(transaction);
            };

            const onErrorsHandler = (reason: TonConnectError): void => {
                reject(reason);
            };

            this.connector
                .sendTransaction(transaction, onRequestSent)
                .then(result => onTransactionHandler(result))
                .catch(reason => onErrorsHandler(reason));

            abortSignal.addEventListener('abort', (): void => {
                reject(new TonConnectUIError('Transaction was not sent'));
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

        let fullLastSelectedWalletInfo: WalletInfoWithOpenMethod;
        if (!('name' in lastSelectedWalletInfo)) {
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

            fullLastSelectedWalletInfo = {
                ...walletInfo,
                ...lastSelectedWalletInfo
            };
        } else {
            fullLastSelectedWalletInfo = lastSelectedWalletInfo;
        }

        return fullLastSelectedWalletInfo;
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

type WaitWalletConnectionOptions = {
    ignoreErrors?: boolean;
    abortSignal?: AbortSignal | null;
};

type WaitSendTransactionOptions = {
    transaction: SendTransactionRequest;
    abortSignal: AbortSignal;
};

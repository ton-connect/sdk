import type { Account, ConnectAdditionalRequest } from '@tonconnect/sdk';
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
    addReturnStrategy,
    getSystemTheme,
    getUserAgent,
    openLinkBlank,
    preloadImages,
    redirectToTelegram,
    subscribeToThemeChange
} from 'src/app/utils/web-api';
import { TonConnectUiOptions } from 'src/models/ton-connect-ui-options';
import { setBorderRadius, setColors, setTheme } from 'src/app/state/theme-state';
import { mergeOptions } from 'src/app/utils/options';
import { appState, setAppState } from 'src/app/state/app.state';
import { unwrap } from 'solid-js/store';
import { setLastSelectedWalletInfo } from 'src/app/state/modals-state';
import { ActionConfiguration, StrictActionConfiguration } from 'src/models/action-configuration';
import { ConnectedWallet, WalletInfoWithOpenMethod } from 'src/models/connected-wallet';
import { applyWalletsListConfiguration, eqWalletName } from 'src/app/utils/wallets';
import { uniq } from 'src/app/utils/array';
import { Loadable } from 'src/models/loadable';

export class TonConnectUI {
    public static getWallets(): Promise<WalletInfo[]> {
        return TonConnect.getWallets();
    }

    private readonly walletInfoStorage = new WalletInfoStorage();

    private readonly preferredWalletStorage = new PreferredWalletStorage();

    public readonly connector: ITonConnect;

    private walletInfo: WalletInfoWithOpenMethod | null = null;

    private actionsConfiguration?: ActionConfiguration;

    private readonly walletsList: Promise<WalletInfo[]>;

    private connectRequestParametersCallback?: (
        parameters: ConnectAdditionalRequest | undefined
    ) => void;

    /**
     * Function that unsubscribes from the system theme change event.
     * @internal
     */
    private systemThemeChangeUnsubscribe: (() => void) | null = null;

    /**
     * Function that unsubscribes from the wallet change event.
     * @internal
     */
    private onStatusChangeUnsubscribe: (() => void) | null = null;

    /**
     * Function that unmounts the widget, call it to remove the widget from the DOM.
     * @internal
     */
    private readonly unmountApp: () => void;

    /**
     * Function that removes the root element, call it to remove the root element from the DOM.
     * @internal
     */
    private readonly unmountRootId: () => void;

    private unmounted: boolean = false;

    /**
     * Function that unmounts the app. Should be called after the widget is not needed anymore.
     */
    public unmount(): void {
        if (this.unmounted) {
            return;
        }

        this.unmounted = true;
        this.systemThemeChangeUnsubscribe?.();
        this.onStatusChangeUnsubscribe?.();
        this.unmountApp();
        this.unmountRootId();
    }

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
        console.log(`Setting new UI options: ${JSON.stringify(options)}, is unmounted: ${this.unmounted}`);
        if (this.unmounted) {
            return;
        }

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

            return merged;
        });
    }

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

        this.walletsList = this.getWallets();

        this.walletsList.then(list => preloadImages(uniq(list.map(item => item.imageUrl))));

        const widgetRootId = options?.widgetRootId || 'tc-widget-root';

        this.unmountRootId = this.normalizeWidgetRoot(widgetRootId);

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

        this.unmountApp = widgetController.renderApp(widgetRootId, this);
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
     * Opens the modal window and handles a wallet connection.
     */
    public async connectWallet(): Promise<ConnectedWallet> {
        const walletsList = await this.getWallets();
        const embeddedWallet = walletsList.find(isWalletInfoCurrentlyEmbedded);

        if (embeddedWallet) {
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
        } else {
            widgetController.openWalletsModal();
        }

        return new Promise((resolve, reject) => {
            const unsubscribe = this.connector.onStatusChange(async wallet => {
                unsubscribe!();
                if (wallet) {
                    const lastSelectedWalletInfo = await this.getSelectedWalletInfo(wallet);

                    resolve({
                        ...wallet,
                        ...(lastSelectedWalletInfo || this.walletInfoStorage.getWalletInfo())!
                    });
                } else {
                    reject(new TonConnectUIError('Wallet was not connected'));
                }
            }, reject);
        });
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

        const { notifications, modals, returnStrategy, twaReturnUrl, skipRedirectToWallet } =
            this.getModalsAndNotificationsConfiguration(options);

        const userOSIsIos = getUserAgent().os === 'ios';
        const shouldSkipRedirectToWallet =
            (skipRedirectToWallet === 'ios' && userOSIsIos) || skipRedirectToWallet === 'always';

        if (
            this.walletInfo &&
            'universalLink' in this.walletInfo &&
            this.walletInfo.openMethod === 'universal-link' &&
            !shouldSkipRedirectToWallet
        ) {
            if (isTelegramUrl(this.walletInfo.universalLink)) {
                redirectToTelegram(this.walletInfo.universalLink, { returnStrategy, twaReturnUrl });
            } else {
                openLinkBlank(addReturnStrategy(this.walletInfo.universalLink, returnStrategy));
            }
        }

        widgetController.setAction({
            name: 'confirm-transaction',
            showNotification: notifications.includes('before'),
            openModal: modals.includes('before')
        });

        try {
            const result = await this.connector.sendTransaction(tx);

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
        }
    }

    private subscribeToWalletChange(): void {
        this.onStatusChangeUnsubscribe = this.connector.onStatusChange(async wallet => {
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

    private normalizeWidgetRoot(rootId: string): () => void {
        let rootElement: HTMLElement | null = null;

        if (!document.getElementById(rootId)) {
            console.log(`Creating root element with id ${rootId}`);
            rootElement = document.createElement('div');
            rootElement.id = rootId;
            document.body.appendChild(rootElement);
        } else {
            console.log(
              `Skipping root element creation with id ${rootId}, because it already exists, 4`
            );
        }

        return () => {
            rootElement?.remove();
        };
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

        const skipRedirectToWallet =
            options?.skipRedirectToWallet ||
            this.actionsConfiguration?.skipRedirectToWallet ||
            'ios';

        return {
            notifications,
            modals,
            returnStrategy,
            twaReturnUrl,
            skipRedirectToWallet
        };
    }
}

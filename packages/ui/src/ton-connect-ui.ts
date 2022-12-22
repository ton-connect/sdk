import type { Account } from '@tonconnect/sdk';
import {
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
import { WalletInfoStorage } from 'src/storage';
import { isDevice } from 'src/app/styles/media';
import { getSystemTheme, openLinkBlank, subscribeToThemeChange } from 'src/app/utils/web-api';
import { TonConnectUiOptions } from 'src/models/ton-connect-ui-options';
import { setTheme } from 'src/app/state/theme-state';
import { mergeOptions } from 'src/app/utils/options';
import { setAppState } from 'src/app/state/app.state';
import { unwrap } from 'solid-js/store';
import { THEME } from 'src/models/THEME';

export class TonConnectUi {
    private readonly walletInfoStorage = new WalletInfoStorage();

    private readonly connector: ITonConnect;

    private _walletInfo: WalletInfo | null = null;

    private systemThemeChangeUnsubscribe: (() => void) | null = null;

    /**
     * Current connection status
     */
    public get connected(): boolean {
        return this.connector.connected;
    }

    /**
     * Current connected account or null
     */
    public get account(): Account | null {
        return this.connector.account;
    }

    /**
     * Curren connected wallet app or null
     */
    public get wallet(): Wallet | null {
        return this.connector.wallet;
    }

    /**
     * Curren connected wallet's info or null
     */
    public get walletInfo(): WalletInfo | null {
        return this._walletInfo;
    }

    public set uiOptions(options: TonConnectUiOptions) {
        this.checkButtonRootExist(options.buttonRootId);
        let theme: THEME | undefined;
        if (options.theme === 'SYSTEM') {
            theme = getSystemTheme();

            if (!this.systemThemeChangeUnsubscribe) {
                this.systemThemeChangeUnsubscribe = subscribeToThemeChange(theme =>
                    setTheme(theme)
                );
            }
        } else {
            theme =
                options.theme === 'DARK'
                    ? THEME.DARK
                    : options.theme === 'LIGHT'
                    ? THEME.LIGHT
                    : undefined;
            this.systemThemeChangeUnsubscribe?.();
        }

        /* setThemeState(state =>
            mergeOptions({ theme, accentColor: options.accentColor }, unwrap(state))
        );*/

        setTheme(theme!);

        setAppState(state => {
            const merged = mergeOptions(
                {
                    language: options.language,
                    buttonConfiguration: options.buttonConfiguration,
                    widgetConfiguration: options.widgetConfiguration
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
            this.connector = new TonConnect();
        }

        this.getWallets();
        const rootId = this.normalizeWidgetRoot(options?.widgetRootId);

        this.subscribeToWalletChange();

        if (options?.restoreConnection) {
            this.connector.restoreConnection();
        }

        this.uiOptions = options || {};
        setAppState({ connector: this.connector });

        widgetController.renderApp(rootId, this);
    }

    /**
     * Returns available wallets list.
     */
    public async getWallets(): Promise<WalletInfo[]> {
        return this.connector.getWallets();
    }

    /**
     * Subscribe to connection status change
     * @return function which has to be called to unsubscribe
     */
    public onStatusChange(
        ...parameters: Parameters<ITonConnect['onStatusChange']>
    ): ReturnType<ITonConnect['onStatusChange']> {
        return this.connector.onStatusChange(...parameters);
    }

    /**
     * Opens the modal window and handles a wallet connection.
     */
    public connectWallet(): Promise<Wallet> {
        widgetController.openWalletsModal();

        return new Promise((resolve, reject) => {
            const unsubscribe = this.connector.onStatusChange(wallet => {
                unsubscribe!();
                if (wallet) {
                    resolve(wallet);
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
        this.walletInfoStorage.removeWalletInfo();
        return this.connector.disconnect();
    }

    /**
     * Opens the modal window and handles the tx sending
     * @param tx
     * @param options
     */
    public async sendTransaction(
        tx: SendTransactionRequest,
        options?: {
            showModalBefore: boolean;
            showSuccessModalAfter: boolean;
            showErrorModalAfter: boolean;
        }
    ): Promise<SendTransactionResponse> {
        if (!this.connected || !this.walletInfo) {
            throw new TonConnectUIError('Connect wallet to send a transaction.');
        }

        if (!isDevice('desktop') && 'universalLink' in this.walletInfo) {
            openLinkBlank(this.walletInfo.universalLink);
        }

        if (options?.showModalBefore || !options) {
            widgetController.openActionsModal('confirm-transaction');
        }
        try {
            const result = await this.connector.sendTransaction(tx);
            if (options?.showSuccessModalAfter) {
                widgetController.openActionsModal('transaction-sent');
            }

            return result;
        } catch (e) {
            if (options?.showErrorModalAfter) {
                widgetController.openActionsModal('transaction-canceled');
            }
            if (e instanceof TonConnectError) {
                throw e;
            } else {
                console.error(e);
                throw new TonConnectUIError('Unhandled error:' + e);
            }
        }
    }

    private subscribeToWalletChange(): void {
        this.connector.onStatusChange(wallet => {
            if (wallet) {
                this.updateWalletInfo();
            } else {
                this.walletInfoStorage.removeWalletInfo();
            }
        });
    }

    private updateWalletInfo(): void {
        const lastSelectedWalletInfo = widgetController.getSelectedWalletInfo();

        if (lastSelectedWalletInfo) {
            this._walletInfo = lastSelectedWalletInfo;
            this.walletInfoStorage.setWalletInfo(lastSelectedWalletInfo);
        } else {
            this._walletInfo = this.walletInfoStorage.getWalletInfo();
        }
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
}

import {
    ITonConnect,
    SendTransactionRequest,
    SendTransactionResponse,
    TonConnect,
    TonConnectError,
    Wallet,
    WalletInfo
} from '@tonconnect/sdk';
import type { Account } from '@tonconnect/sdk';
import { widgetController } from 'src/app';
import { TonConnectUIError } from 'src/errors/ton-connect-ui.error';
import { TonUiOptions } from 'src/models/ton-ui-options';
import { WalletInfoStorage } from 'src/storage';

export class TonConnectUi {
    private readonly walletInfoStorage = new WalletInfoStorage();

    private readonly connector: ITonConnect;

    private _walletInfo: WalletInfo | null = null;

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

    constructor(options?: {
        uiOptions?: TonUiOptions;
        connector?: ITonConnect;
        restoreConnection?: boolean;
        widgetRootId?: string;
        buttonRootId?: string;
    }) {
        this.connector = options?.connector || new TonConnect();
        this.getWallets();
        const rootId = this.normalizeWidgetRoot(options?.widgetRootId);
        const buttonRoot = options?.buttonRootId
            ? document.getElementById(options.buttonRootId)
            : null;
        widgetController.renderApp(rootId, buttonRoot, this, this.connector);

        this.subscribeToWalletChange();

        if (options?.restoreConnection) {
            this.connector.restoreConnection();
        }
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
        if (options?.showModalBefore) {
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
}

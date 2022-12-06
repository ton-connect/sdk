import {
    ITonConnect,
    SendTransactionRequest,
    SendTransactionResponse,
    TonConnect,
    Wallet,
    WalletInfo
} from '@tonconnect/sdk';
import type { Account } from '@tonconnect/sdk';
import { widgetController } from 'src/app';
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
        debugger;
        return this.connector.getWallets();
    }

    /**
     * Subscribe to connection status change
     * @param callback subscription callback
     * @return function which has to be called to unsubscribe
     */
    public onStatusChange(
        callback: Parameters<ITonConnect['onStatusChange']>[0]
    ): ReturnType<ITonConnect['onStatusChange']> {
        return this.connector.onStatusChange(callback);
    }

    /**
     * Opens the modal window and handles a wallet connection.
     */
    public async connectWallet(): Promise<void> {
        widgetController.openWalletsModal();
    }

    /**
     * Disconnect wallet and clean localstorage.
     */
    public disconnect(): Promise<void> {
        this.walletInfoStorage.removeWalletInfo();
        return this.connector.disconnect();
    }

    /**
     * @todo
     * Opens the modal window and handles an account switching
     * Will not be available in the first version
     */
    // public switchAccount(): void {}

    /**
     * Opens the modal window and handles the tx sending
     * @param tx
     * @param options
     */
    public async sendTransaction(
        tx: SendTransactionRequest,
        options: {
            showModalBefore: boolean;
            showSuccessModalAfter: boolean;
            showErrorModalAfter: boolean;
        }
    ): Promise<SendTransactionResponse> {
        void options;
        return this.connector.sendTransaction(tx);
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

    /**
     * @todo
     * Opens the modal window and handles the message signing
     * Will not be available in the first version
     */
    /*public async sign(signRequest: SignMessageRequest): Promise<SignMessageResponse> {
        // const widget = new Widget();
        // open modal widget

        return this.connector.sign(signRequest);
    }*/

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

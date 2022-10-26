import {
    ITonConnect,
    SendTransactionRequest,
    SendTransactionResponse,
    TonConnect,
    WalletAppInfo
} from '../../sdk';
import type { Account } from '../../sdk';
import { widgetController } from 'src/app';
import { Button } from 'src/app/views/button';
import { TonUiOptions } from 'src/models/ton-ui-options';

export class TonConnectUi {
    public readonly button: Button;

    private readonly connector: ITonConnect;

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
    public get walletAppInfo(): WalletAppInfo | null {
        return this.connector.walletAppInfo;
    }

    constructor(options?: {
        uiOptions?: TonUiOptions;
        connector?: ITonConnect;
        autoConnect?: boolean;
        widgetRoot?: string;
    }) {
        this.connector = options?.connector || new TonConnect();
        this.button = new Button(this, options?.uiOptions?.buttonConfiguration);

        const rootId = this.normalizeWidgetRoot(options?.widgetRoot);
        widgetController.renderApp(rootId);

        if (options?.autoConnect) {
            this.connector.autoConnect();
        }
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

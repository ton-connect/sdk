import { TonConnect } from 'src/ton-connect';
import { Account } from 'src/ton-connect/core/models/wallet/account';
import { SendTransactionRequest } from 'src/ton-connect/core/models/protocol/actions/send-transaction/send-transaction-request';
import { SendTransactionResponse } from 'src/ton-connect/core/models/protocol/actions/send-transaction/send-transaction-response';
import { WalletAppInfo } from 'src/ton-connect/core/models/wallet/wallet-app-info';
import { ITonConnect } from 'src/ton-connect/ton-connect.interface';
import { WidgetControllerOptions } from 'src/widget/models/widget-controller-options';
import { Button } from 'src/widget/views';

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
        uiOptions?: WidgetControllerOptions;
        connector?: ITonConnect;
        autoConnect?: boolean;
    }) {
        this.button = new Button(this, options?.uiOptions?.buttonConfiguration);
        this.connector = options?.connector || new TonConnect();

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
    public async connectWallet(): Promise<void> {}

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
}

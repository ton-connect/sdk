import { defaultButtonConfiguration } from 'src/app/constants/default-button-configuration';
import { mergeOptions } from 'src/app/utils/options';
import { ButtonConfiguration } from 'src/models/button-configuration';
import { TonConnectUi } from 'src/ton-connect-ui';

export class Button {
    private walletConnected: boolean;

    private address: string = '';

    private root: HTMLElement | null = null;

    private configuration: Required<ButtonConfiguration>;

    constructor(
        private readonly widgetController: TonConnectUi,
        buttonConfiguration?: ButtonConfiguration
    ) {
        this.configuration = mergeOptions(buttonConfiguration, defaultButtonConfiguration);
        this.walletConnected = widgetController.connected;

        this.subscribeToWalletState();
    }

    private subscribeToWalletState(): void {
        this.widgetController.onStatusChange(walletInfo => {
            this.walletConnected = !!walletInfo;
            this.address = walletInfo?.account.address || '';
            this.rerender();
        });
    }

    public render(root: HTMLElement): void {
        this.root = root;
        this.rerender();
    }

    private rerender(): void {
        const template = this.walletConnected
            ? this.getDropdownButtonTemplate()
            : this.getSimpleButtonTemplate();
        this.root?.insertAdjacentHTML('afterbegin', template);
    }

    private getSimpleButtonTemplate(): string {
        return `
        <button onclick="${this.widgetController.connectWallet}">Connect wallet</button>
        `;
    }

    /**
     * @TODO
     * @private
     */
    private getDropdownButtonTemplate(): string {
        return `
        <div>${this.address}</div>
        <button onclick="${this.widgetController.disconnect}">Disconnect</button>
        `;
    }
}

import { mergeOptions } from 'src/ton-connect/utils/options';
import { WidgetController } from 'src/widget';
import { defaultButtonConfiguration } from 'src/widget/constants/default-button-configuration';
import { ButtonConfiguration } from 'src/widget/models/button-configuration';

export class Button {
    private walletConnected: boolean;

    private address: string = '';

    private root: HTMLElement | null = null;

    private configuration: Required<ButtonConfiguration>;

    constructor(
        private readonly widgetController: WidgetController,
        buttonConfiguration?: ButtonConfiguration
    ) {
        this.configuration = mergeOptions(buttonConfiguration, defaultButtonConfiguration);
        this.walletConnected = widgetController.connector.connected;

        this.subscribeToWalletState();
    }

    private subscribeToWalletState(): void {
        this.widgetController.connector.onConnect(walletInfo => {
            this.walletConnected = true;
            this.address = walletInfo.account.address;
            this.rerender();
        });

        this.widgetController.connector.onAccountChange(account => {
            this.address = account.address;
            this.rerender();
        });

        this.widgetController.connector.onDisconnect(() => {
            this.walletConnected = false;
            this.address = '';
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

    private getDropdownButtonTemplate(): string {
        return `
        <div>${this.address}</div>
        <button onclick="${this.widgetController.connector.disconnect}">Disconnect</button>
        <button onclick="${this.widgetController.switchAccount}">Switch Account</button>
        `;
    }
}

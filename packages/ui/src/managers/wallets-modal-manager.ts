import {
    setLastSelectedWalletInfo,
    walletsModalState,
    WalletsModalState
} from 'src/app/state/modals-state';
import { createEffect } from 'solid-js';
import {
    ConnectAdditionalRequest,
    isWalletInfoCurrentlyEmbedded,
    ITonConnect,
    WalletInfoCurrentlyEmbedded
} from '@tonconnect/sdk';
import { appState } from 'src/app/state/app.state';
import { widgetController } from 'src/app/widget-controller';

interface WalletsModalManagerCreateOptions {
    /**
     * TonConnect instance.
     */
    connector: ITonConnect;

    /**
     * Set connect request parameters callback.
     */
    setConnectRequestParametersCallback: (
        callback: (parameters?: ConnectAdditionalRequest) => void
    ) => void;
}

/**
 * Manages the modal window state.
 */
export class WalletsModalManager {
    /**
     * TonConnect instance.
     * @internal
     */
    private readonly connector: ITonConnect;

    /**
     * Callback to call when the connection parameters are received.
     * @internal
     */
    private readonly setConnectRequestParametersCallback: (
        callback: (parameters?: ConnectAdditionalRequest) => void
    ) => void;

    /**
     * List of subscribers to the modal window state changes.
     * @internal
     */
    private consumers: Array<(state: WalletsModalState) => void> = [];

    /**
     * Current modal window state.
     */
    public state: WalletsModalState = walletsModalState();

    constructor(options: WalletsModalManagerCreateOptions) {
        this.connector = options.connector;
        this.setConnectRequestParametersCallback = options.setConnectRequestParametersCallback;

        createEffect(() => {
            const state = walletsModalState();
            this.state = state;
            this.consumers.forEach(consumer => consumer(state));
        });
    }

    /**
     * Opens the modal window.
     */
    public async open(): Promise<void> {
        const walletsList = await this.connector.getWallets();
        const embeddedWallet = walletsList.find(isWalletInfoCurrentlyEmbedded);

        if (embeddedWallet) {
            return this.connectEmbeddedWallet(embeddedWallet);
        } else {
            return this.connectExternalWallet();
        }
    }

    /**
     * Closes the modal window.
     */
    public close(): void {
        widgetController.closeWalletsModal('action-cancelled');
    }

    /**
     * Subscribe to the modal window state changes, returns unsubscribe function.
     */
    public onStateChange(onChange: (state: WalletsModalState) => void): () => void {
        this.consumers.push(onChange);

        return () => {
            this.consumers = this.consumers.filter(consumer => consumer !== onChange);
        };
    }

    /**
     * Initiates a connection with an embedded wallet.
     * @param embeddedWallet - Information about the embedded wallet to connect to.
     * @internal
     */
    private connectEmbeddedWallet(embeddedWallet: WalletInfoCurrentlyEmbedded): void {
        const connect = (parameters?: ConnectAdditionalRequest): void => {
            setLastSelectedWalletInfo(embeddedWallet);
            this.connector.connect({ jsBridgeKey: embeddedWallet.jsBridgeKey }, parameters);
        };

        const additionalRequest = appState.connectRequestParameters;
        if (additionalRequest?.state === 'loading') {
            this.setConnectRequestParametersCallback(connect);
        } else {
            connect(additionalRequest?.value);
        }
    }

    /**
     * Opens the modal window to connect to an external wallet, and waits when modal window is opened.
     * @internal
     */
    private async connectExternalWallet(): Promise<void> {
        widgetController.openWalletsModal();

        return new Promise<void>(resolve => {
            const unsubscribe = this.onStateChange(state => {
                const { status } = state;
                if (status === 'opened') {
                    unsubscribe();
                    resolve();
                }
            });
        });
    }
}

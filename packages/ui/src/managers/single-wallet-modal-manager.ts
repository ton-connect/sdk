import { setLastSelectedWalletInfo, singleWalletModalState } from 'src/app/state/modals-state';
import { createEffect } from 'solid-js';
import {
    ConnectAdditionalRequest,
    isWalletInfoCurrentlyEmbedded,
    isWalletInfoRemote,
    ITonConnect,
    WalletInfoCurrentlyEmbedded,
    WalletInfoRemote
} from '@tonconnect/sdk';
import { appState } from 'src/app/state/app.state';
import { widgetController } from 'src/app/widget-controller';
import { SingleWalletModal, SingleWalletModalState } from 'src/models/single-wallet-modal';
import { isInTMA, sendExpand } from 'src/app/utils/tma-api';
import { TonConnectUIError } from 'src/errors';
import { applyWalletsListConfiguration, eqWalletName } from 'src/app/utils/wallets';
import { TonConnectUITracker } from 'src/tracker/ton-connect-ui-tracker';
import { WalletsModalCloseReason } from 'src/models';

interface SingleWalletModalManagerCreateOptions {
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

    /**
     * Emits user action event to the EventDispatcher. By default, it uses `window.dispatchEvent` for browser environment.
     */
    tracker: TonConnectUITracker;
}

/**
 * Manages the modal window state.
 */
export class SingleWalletModalManager implements SingleWalletModal {
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
    private consumers: Array<(state: SingleWalletModalState) => void> = [];

    /**
     * Emits user action event to the EventDispatcher. By default, it uses `window.dispatchEvent` for browser environment.
     * @internal
     */
    private readonly tracker: TonConnectUITracker;

    /**
     * Current modal window state.
     */
    public state: SingleWalletModalState = singleWalletModalState();

    constructor(options: SingleWalletModalManagerCreateOptions) {
        this.connector = options.connector;
        this.tracker = options.tracker;
        this.setConnectRequestParametersCallback = options.setConnectRequestParametersCallback;

        createEffect(() => {
            const state = singleWalletModalState();
            this.state = state;
            this.consumers.forEach(consumer => consumer(state));
        });
    }

    /**
     * Opens the modal window with the specified wallet.
     * @param wallet - Wallet app name.
     * @throws TonConnectUIError if the specified wallet is not found.
     */
    public async open(wallet: string): Promise<void> {
        this.tracker.trackConnectionStarted();

        const fetchedWalletsList = await this.connector.getWallets();
        const walletsList = applyWalletsListConfiguration(
            fetchedWalletsList,
            appState.walletsListConfiguration
        );

        // TODO: move to ITonConnect
        const embeddedWallet = walletsList.find(isWalletInfoCurrentlyEmbedded);
        const isEmbeddedWalletExist = !!embeddedWallet;
        if (isEmbeddedWalletExist) {
            return this.connectEmbeddedWallet(embeddedWallet);
        }

        // TODO: move to ITonConnect
        const externalWallets = walletsList.filter(isWalletInfoRemote);
        const externalWallet = externalWallets.find(walletInfo => eqWalletName(walletInfo, wallet));
        const isExternalWalletExist = !!externalWallet;
        if (isExternalWalletExist) {
            return this.openSingleWalletModal(externalWallet);
        }

        const error = `Trying to open modal window with unknown wallet "${wallet}".`;
        this.tracker.trackConnectionError(error);
        throw new TonConnectUIError(error);
    }

    /**
     * Closes the modal window.
     * @default 'action-cancelled'
     */
    public close(reason: WalletsModalCloseReason = 'action-cancelled'): void {
        if (reason === 'action-cancelled') {
            this.tracker.trackConnectionError('Connection was cancelled');
        }
        widgetController.closeSingleWalletModal('action-cancelled');
    }

    /**
     * Subscribe to the modal window state changes, returns unsubscribe function.
     */
    public onStateChange(onChange: (state: SingleWalletModalState) => void): () => void {
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
     * Opens the modal window to connect to a specified wallet, and waits when modal window is opened.
     */
    public async openSingleWalletModal(wallet: WalletInfoRemote): Promise<void> {
        if (isInTMA()) {
            sendExpand();
        }

        widgetController.openSingleWalletModal(wallet);

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

import { setLastSelectedWalletInfo, singleWalletModalState } from 'src/app/state/modals-state';
import { createEffect } from 'solid-js';
import {
    ConnectAdditionalRequest,
    isWalletInfoCurrentlyEmbedded,
    isWalletInfoRemote,
    ITonConnect,
    Traceable,
    UUIDv7,
    WalletInfoCurrentlyEmbedded,
    WalletInfoRemote
} from '@tonconnect/sdk';
import { appState } from 'src/app/state/app.state';
import { widgetController } from 'src/app/widget-controller';
import { SingleWalletModal, SingleWalletModalState } from 'src/models/single-wallet-modal';
import { isInTMA, sendExpand } from 'src/app/utils/tma-api';
import { isMobile, updateIsMobile } from 'src/app/hooks/isMobile';
import { trackWalletPick } from 'src/app/utils/wallet-selection';
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
        const traceId = UUIDv7();

        this.tracker.trackConnectionStarted(traceId);

        const fetchedWalletsList = await this.connector.getWallets();
        const walletsList = applyWalletsListConfiguration(
            fetchedWalletsList,
            appState.walletsListConfiguration
        );

        // TODO: move to ITonConnect
        const embeddedWallet = walletsList.find(isWalletInfoCurrentlyEmbedded);
        const isEmbeddedWalletExist = !!embeddedWallet;
        if (isEmbeddedWalletExist) {
            return this.connectEmbeddedWallet(embeddedWallet, { traceId });
        }

        // TODO: move to ITonConnect
        const externalWallets = walletsList.filter(isWalletInfoRemote);
        const externalWallet = externalWallets.find(walletInfo => eqWalletName(walletInfo, wallet));
        const isExternalWalletExist = !!externalWallet;
        if (isExternalWalletExist) {
            // The dApp named the wallet, so no pick happened in our UI — but the journey is
            // otherwise a normal one, and follows the same platform rule: on mobile the
            // connection modal redirects on mount, so this is the commitment; on desktop it opens
            // a second screen, so it is only a preselection.
            // Runs before the modal renders, so refresh the signal first, as the modal
            // components themselves do on open.
            updateIsMobile();

            trackWalletPick(this.tracker, {
                isMobile: isMobile(),
                walletAppName: externalWallet.appName,
                surface: 'single-wallet-modal',
                selectionSource: 'auto-dapp-directed',
                traceId
            });

            return this.openSingleWalletModal(externalWallet, { traceId });
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
    private connectEmbeddedWallet(
        embeddedWallet: WalletInfoCurrentlyEmbedded,
        options: Traceable
    ): void {
        const connect = (parameters?: ConnectAdditionalRequest): void => {
            this.tracker.trackWalletSelected(
                embeddedWallet.appName,
                'embedded',
                'auto-embedded',
                options.traceId
            );
            setLastSelectedWalletInfo(embeddedWallet);
            this.connector.connect({ jsBridgeKey: embeddedWallet.jsBridgeKey }, parameters, {
                traceId: options.traceId
            });
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
    public async openSingleWalletModal(
        wallet: WalletInfoRemote,
        options?: Traceable
    ): Promise<void> {
        if (isInTMA()) {
            sendExpand();
        }

        widgetController.openSingleWalletModal(wallet, { traceId: options?.traceId });

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

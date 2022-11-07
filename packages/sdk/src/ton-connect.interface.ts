import { TonConnectError } from 'src/errors';
import { Account, WalletConnectionSource, Wallet } from 'src/models';
import { SendTransactionRequest, SendTransactionResponse } from 'src/models/methods';
import { ConnectAdditionalRequest } from 'src/models/methods/connect/connect-additional-request';
import { JSBridgeWalletConfig, WalletConfig } from 'src/models/wallet/wallet-config';
import { WalletConnectionSourceJS } from 'src/models/wallet/wallet-connection-source';

export interface ITonConnect {
    /**
     * Shows if the wallet is connected right now.
     */
    connected: boolean;

    /**
     * Current connected account or null if no account is connected.
     */
    account: Account | null;

    /**
     * Current connected wallet or null if no account is connected.
     */
    wallet: Wallet | null;

    /**
     * Allows to get information about supported wallets
     */
    walletsList: {
        getWalletsList: () => Promise<WalletConfig[]>;
        getInjectedWalletsList: () => Promise<JSBridgeWalletConfig[]>;
    };

    /**
     * If app is opened in some wallet's browser returns that wallet config. Else returns null;
     */
    inWhichWalletBrowser(): Promise<JSBridgeWalletConfig | null>;

    /**
     * Allows to subscribe to connection status changes and handle connection errors.
     * @param callback will be called after connections status changes with actual wallet or null.
     * @param errorsHandler (optional) will be called with some instance of TonConnectError when connect error is received.
     * @returns unsubscribe callback.
     */
    onStatusChange(
        callback: (walletInfo: Wallet | null) => void,
        errorsHandler?: (err: TonConnectError) => void
    ): () => void;

    /**
     * Generates universal link for an external wallet and subscribes to the wallet's bridge, or sends connect request to the injected wallet.
     * @param wallet wallet's bridge url and universal link for an external wallet or jsBridge key for the injected wallet.
     * @param request (optional) additional request to pass to the wallet while connect (currently only ton_proof is available).
     * @returns universal link if external wallet was passed or void for the injected wallet.
     */
    connect<T extends WalletConnectionSource>(
        wallet: T,
        request?: ConnectAdditionalRequest
    ): T extends WalletConnectionSourceJS ? void : string;

    /**
     * Try to restore existing session and reconnect to the corresponding wallet. Call it immediately when your app is loaded.
     */
    restoreConnection(): Promise<void>;

    /**
     * Disconnect form thw connected wallet and drop current session.
     */
    disconnect(): Promise<void>;

    /**
     * Asks connected wallet to sign and send the transaction.
     * @param transaction transaction to send.
     * @returns signed transaction boc that allows you to find the transaction in the blockchain.
     * If user rejects transaction, method will throw the corresponding error.
     */
    sendTransaction(transaction: SendTransactionRequest): Promise<SendTransactionResponse>;
}

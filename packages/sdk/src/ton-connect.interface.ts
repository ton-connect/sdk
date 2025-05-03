import { TonConnectError } from 'src/errors';
import { Account, Wallet, WalletConnectionSource, WalletConnectionSourceHTTP } from 'src/models';
import { SendTransactionRequest, SendTransactionResponse, SignDataResponse } from 'src/models/methods';
import { ConnectAdditionalRequest } from 'src/models/methods/connect/connect-additional-request';
import { WalletInfo } from 'src/models/wallet/wallet-info';
import { WalletConnectionSourceJS } from 'src/models/wallet/wallet-connection-source';
import { SignDataPayload } from '@tonconnect/protocol';

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
     * Returns available wallets list.
     */
    getWallets(): Promise<WalletInfo[]>;

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
     * @param wallet wallet's bridge url and universal link for an external wallet or jsBridge key for the injected wallet, or list of bridges urls for creating an universal connection request for the corresponding wallets.
     * @param request (optional) additional request to pass to the wallet while connect (currently only ton_proof is available).
     * @returns universal link if external wallet was passed or void for the injected wallet.
     */
    connect<T extends WalletConnectionSource | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[]>(
        wallet: T,
        request?: ConnectAdditionalRequest
    ): T extends WalletConnectionSourceJS ? void : string;

    /**
     * Try to restore existing session and reconnect to the corresponding wallet. Call it immediately when your app is loaded.
     */
    restoreConnection(options?: {
        openingDeadlineMS?: number;
        signal?: AbortSignal;
    }): Promise<void>;

    /**
     * Pause bridge HTTP connection. Might be helpful, if you want to pause connections while browser tab is unfocused,
     * or if you use SDK with NodeJS and want to save server resources.
     */
    pauseConnection(): void;

    /**
     * Unpause bridge HTTP connection if it is paused.
     */
    unPauseConnection(): Promise<void>;

    /**
     * Disconnect form thw connected wallet and drop current session.
     */
    disconnect(options?: { signal?: AbortSignal }): Promise<void>;

    /**
     * Asks connected wallet to sign and send the transaction.
     * @param transaction transaction to send.
     * @param options (optional) onRequestSent callback will be called after the transaction is sent and signal to abort the request.
     * @returns signed transaction boc that allows you to find the transaction in the blockchain.
     * If user rejects transaction, method will throw the corresponding error.
     */
    sendTransaction(
        transaction: SendTransactionRequest,
        options?: {
            onRequestSent?: () => void;
            signal?: AbortSignal;
        }
    ): Promise<SendTransactionResponse>;

    /** @deprecated use sendTransaction(transaction, options) instead */
    sendTransaction(
        transaction: SendTransactionRequest,
        onRequestSent?: () => void
    ): Promise<SendTransactionResponse>;

    signData(
        data: SignDataPayload,
        options?: {
            onRequestSent?: () => void;
            signal?: AbortSignal;
        }
    ): Promise<SignDataResponse> 
}

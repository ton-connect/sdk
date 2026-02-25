import { ChainId } from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors';
import {
    Account,
    Wallet,
    WalletConnectionSource,
    WalletConnectionSourceHTTP,
    WalletConnectionSourceWalletConnect
} from 'src/models';
import {
    SendTransactionRequest,
    SendTransactionResponse,
    SignDataResponse,
    SignMessageResponse
} from 'src/models/methods';
import {
    SendTransactionIntentRequest,
    SignDataIntentRequest,
    SignMessageIntentRequest,
    SendActionIntentRequest,
    IntentUrlOptions
} from 'src/models/methods/intents';
import { ConnectAdditionalRequest } from 'src/models/methods/connect/connect-additional-request';
import { WalletInfo } from 'src/models/wallet/wallet-info';
import { WalletConnectionSourceJS } from 'src/models/wallet/wallet-connection-source';
import { SignDataPayload } from '@tonconnect/protocol';
import { OptionalTraceable } from 'src/utils/types';

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
     * @param options (optional) options
     * @returns universal link if external wallet was passed or void for the injected wallet.
     */
    connect<T extends WalletConnectionSource | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[]>(
        wallet: T,
        request?: ConnectAdditionalRequest,
        options?: OptionalTraceable<{
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        }>
    ): T extends WalletConnectionSourceJS
        ? void
        : T extends WalletConnectionSourceWalletConnect
          ? void
          : string;

    /**
     * Try to restore existing session and reconnect to the corresponding wallet. Call it immediately when your app is loaded.
     */
    restoreConnection(
        options?: OptionalTraceable<{
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        }>
    ): Promise<void>;

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
     * Set desired network for the connection. Can only be set before connecting.
     * If wallet connects with a different chain, the SDK will throw an error and abort connection.
     * @param network desired network id (e.g., '-239', '-3', or custom). Pass undefined to allow any network.
     */
    setConnectionNetwork(network?: ChainId): void;

    /**
     * Disconnect form thw connected wallet and drop current session.
     */
    disconnect(options?: OptionalTraceable<{ signal?: AbortSignal }>): Promise<void>;

    /**
     * Asks connected wallet to sign and send the transaction.
     * @param transaction transaction to send.
     * @param options (optional) onRequestSent callback will be called after the transaction is sent and signal to abort the request.
     * @returns signed transaction boc that allows you to find the transaction in the blockchain.
     * If user rejects transaction, method will throw the corresponding error.
     */
    sendTransaction(
        transaction: SendTransactionRequest,
        options?: OptionalTraceable<{
            onRequestSent?: () => void;
            signal?: AbortSignal;
        }>
    ): Promise<OptionalTraceable<SendTransactionResponse>>;

    /** @deprecated use sendTransaction(transaction, options) instead */
    sendTransaction(
        transaction: SendTransactionRequest,
        onRequestSent?: () => void
    ): Promise<OptionalTraceable<SendTransactionResponse>>;

    signData(
        data: SignDataPayload,
        options?: OptionalTraceable<{
            onRequestSent?: () => void;
            signal?: AbortSignal;
        }>
    ): Promise<OptionalTraceable<SignDataResponse>>;

    signMessage(
        message: SendTransactionRequest,
        options?: OptionalTraceable<{
            onRequestSent?: () => void;
            signal?: AbortSignal;
        }>
    ): Promise<OptionalTraceable<SignMessageResponse>>;

    /**
     * Gets the current session ID if available.
     * @returns session ID string or null if not available.
     */
    getSessionId(): Promise<string | null>;

    /**
     * Sends transaction via intent flow.
     * @param transaction transaction to send.
     * @param options optional connect request, abort signal, trace id and URL callback.
     * @returns signed transaction boc that allows you to find the transaction in the blockchain.
     * If user rejects transaction, method will throw the corresponding error.
     */
    sendTransactionIntent(
        transaction: SendTransactionIntentRequest,
        options?: OptionalTraceable<IntentUrlOptions>
    ): Promise<OptionalTraceable<SendTransactionResponse>>;

    /**
     * Signs data via intent flow.
     * @param data data to sign.
     * @param options optional connect request, abort signal, trace id and URL callback.
     * @returns signature and related metadata.
     * If user rejects signing, method will throw the corresponding error.
     */
    signDataIntent(
        data: SignDataIntentRequest,
        options?: OptionalTraceable<IntentUrlOptions>
    ): Promise<OptionalTraceable<SignDataResponse>>;

    /**
     * Signs message via intent flow.
     * @param message message to sign.
     * @param options optional connect request, abort signal, trace id and URL callback.
     * @returns signed message boc.
     * If user rejects signing, method will throw the corresponding error.
     */
    signMessageIntent(
        message: SignMessageIntentRequest,
        options?: OptionalTraceable<IntentUrlOptions>
    ): Promise<OptionalTraceable<SignMessageResponse>>;

    /**
     * Sends action intent.
     * @param action actionUrl to be called by the wallet.
     * @param options optional connect request, abort signal, trace id and URL callback.
     * @returns result of underlying sendTransaction or signData operation.
     * If user rejects action, method will throw the corresponding error.
     */
    sendActionIntent(
        action: SendActionIntentRequest,
        options?: OptionalTraceable<IntentUrlOptions>
    ): Promise<OptionalTraceable<SendTransactionResponse | SignDataResponse>>;
}

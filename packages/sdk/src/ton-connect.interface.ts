import { ChainId } from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors';
import {
    Account,
    IntentResponse,
    Wallet,
    WalletInfo,
    WalletSourceArg,
    WaleltIntentResult
} from 'src/models';
import {
    SendTransactionRequest,
    SendTransactionResponse,
    SignDataResponse,
    SignMessageResponse
} from 'src/models/methods';
import { SendTransactionDraftRequest } from 'src/models/methods/send-transaction-draft';
import { SignMessageDraftRequest } from 'src/models/methods/sign-message-draft';
import { SendActionDraftRequest } from 'src/models/methods/send-action-draft';
import {
    ConnectAdditionalRequest,
    IntentRequest,
    IntentSubscribeOptions
} from 'src/models/methods/connect';
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
    connect<T extends WalletSourceArg>(
        wallet: T,
        request?: ConnectAdditionalRequest,
        options?: OptionalTraceable<{
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        }>
    ): WaleltIntentResult<T>;

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
     * Sends a transaction draft over an existing bridge session.
     * Draft describes transfer items; wallet builds and sends the transaction.
     */
    sendTransactionDraft(
        draft: SendTransactionDraftRequest,
        options?: OptionalTraceable<{
            onRequestSent?: () => void;
            signal?: AbortSignal;
        }>
    ): Promise<OptionalTraceable<SendTransactionResponse>>;

    /**
     * Signs a message draft (same structure as transaction draft, but without sending to blockchain).
     */
    signMessageDraft(
        draft: SignMessageDraftRequest,
        options?: OptionalTraceable<{
            onRequestSent?: () => void;
            signal?: AbortSignal;
        }>
    ): Promise<OptionalTraceable<SignMessageResponse>>;

    /**
     * Sends an action draft. Wallet resolves the action URL and executes underlying sendTransaction/signData/signMessage.
     */
    sendActionDraft(
        draft: SendActionDraftRequest,
        options?: OptionalTraceable<{
            onRequestSent?: () => void;
            signal?: AbortSignal;
        }>
    ): Promise<OptionalTraceable<SendTransactionResponse | SignDataResponse | SignMessageResponse>>;

    subscribeToIntent<TWallet extends WalletSourceArg>(
        wallet: TWallet,
        intent: IntentRequest,
        options?: OptionalTraceable<IntentSubscribeOptions>
    ): Promise<WaleltIntentResult<TWallet>>;

    getSessionId(): Promise<string | null>;

    onIntentResponse(callback: (response: IntentResponse) => void): () => void;
}

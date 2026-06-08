import { ChainId } from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors';
import {
    Account,
    EmbeddedRequest,
    SignMessageRequest,
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
import { ConnectAdditionalRequest } from 'src/models/methods/connect/connect-additional-request';
import { WalletInfo } from 'src/models/wallet/wallet-info';
import { WalletConnectionSourceJS } from 'src/models/wallet/wallet-connection-source';
import { SignDataPayload } from '@tonconnect/protocol';
import { OptionalTraceable } from 'src/utils/types';
import { ConsumableLike } from 'src/utils/consumable';

/**
 * Public contract of the TON Connect connector.
 *
 * @see [TON Connect overview (docs)](https://docs.ton.org/applications/ton-connect/overview)
 */
export interface ITonConnect {
    /**
     * `true` while a wallet session is active. Equivalent to `wallet !== null`.
     */
    connected: boolean;

    /** Currently connected {@link Account}, or `null` when no wallet is connected. */
    account: Account | null;

    /** Currently connected {@link Wallet}, or `null` when no wallet is connected. */
    wallet: Wallet | null;

    /**
     * Fetch the wallets-list registry, merged with any JS-injectable wallets
     * detected on the page.
     *
     * @see [`wallets-list.md`](https://github.com/ton-blockchain/ton-connect/blob/main/spec/wallets-list.md)
     */
    getWallets(): Promise<WalletInfo[]>;

    /**
     * Subscribe to connection state changes. The callback fires after every
     * connect, disconnect, restore. `errorsHandler`, when
     * provided, is called with a {@link TonConnectError} subclass when the
     * connector observes a connect failure (manifest fetch error, user
     * rejection, wrong network, missing features).
     *
     * @returns Unsubscribe function. Call it to stop receiving updates.
     */
    onStatusChange(
        callback: (walletInfo: Wallet | null) => void,
        errorsHandler?: (err: TonConnectError) => void
    ): () => void;

    /**
     * Begin a wallet-connect flow.
     *
     * - For an {@link WalletConnectionSourceHTTP} (or an array of bridge URLs):
     *   returns the universal link to show as a QR code or open in a new tab.
     *   The wallet's reply lands on {@link ITonConnect.onStatusChange}.
     * - For a {@link WalletConnectionSourceJS}: returns `void`; the call sends
     *   the connect request to the injected wallet, which replies via
     *   `onStatusChange`.
     *
     * @param wallet — connection source for a single wallet, or an array of
     *   `{ bridgeUrl }` entries for a multi-wallet connection.
     * @param request — additional `ConnectItem`s to attach.
     * @param options — `openingDeadlineMS` deadline, `signal` for cancellation,
     *   `embeddedRequest` to fold an action into the connect URL, and the
     *   common `traceId` analytics id.
     */
    connect<T extends WalletConnectionSource | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[]>(
        wallet: T,
        request?: ConnectAdditionalRequest,
        options?: OptionalTraceable<{
            /** Reject the connect attempt with `TonConnectError` after this many ms. */
            openingDeadlineMS?: number;
            /** Abort the connect flow externally. */
            signal?: AbortSignal;
            /**
             * Fold an action ({@link EmbeddedRequest}) into the connect URL.
             *
             * @see [Connect-and-act in one tap (docs)](https://docs.ton.org/applications/ton-connect/how-to/embedded-request)
             */
            embeddedRequest?: ConsumableLike<EmbeddedRequest>;
        }>
    ): T extends WalletConnectionSourceJS
        ? void
        : T extends WalletConnectionSourceWalletConnect
          ? void
          : string;

    /**
     * Try to restore the previous session from storage. Call this once on
     * dApp startup, before deciding whether to show the connect modal.
     *
     * Resolves when the restore attempt has settled — either with a successful
     * `onStatusChange` emission (session restored) or with the connector
     * remaining disconnected (no session, or the wallet ended it).
     */
    restoreConnection(
        options?: OptionalTraceable<{
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        }>
    ): Promise<void>;

    /**
     * Pause the SSE bridge connection.
     *
     * @see {@link ITonConnect.unPauseConnection}
     */
    pauseConnection(): void;

    /** Resume a connection paused with {@link ITonConnect.pauseConnection}. */
    unPauseConnection(): Promise<void>;

    /**
     * Constrain the network the connector will accept. Must be set **before**
     * calling {@link ITonConnect.connect} — attempting to change it while a
     * wallet is connected throws.
     *
     * If the wallet replies with a different chain id, the SDK aborts the
     * connection and surfaces `WalletWrongNetworkError` to
     * {@link ITonConnect.onStatusChange}'s error handler.
     *
     * Pass `undefined` to clear the restriction and accept any network.
     *
     * @param network — desired network. See {@link ChainId}.
     */
    setConnectionNetwork(network?: ChainId): void;

    /**
     * End the session. Clears the local session state, fires the disconnected
     * `onStatusChange` event immediately, and sends a `disconnect` RPC to the
     * wallet so it can clean up its side too.
     *
     * @throws {@link WalletNotConnectedError} when no wallet is connected.
     */
    disconnect(options?: OptionalTraceable<{ signal?: AbortSignal }>): Promise<void>;

    /**
     * Ask the connected wallet to sign **and broadcast** a transaction.
     *
     * @throws {@link WalletNotConnectedError} — no wallet is connected.
     * @throws {@link WalletNotSupportFeatureError} — wallet does not advertise the
     *         required `SendTransaction` capabilities.
     * @throws {@link UserRejectsError} — user declined in the wallet.
     * @throws {@link WalletWrongNetworkError} — wallet network differs from the request.
     * @throws {@link TonConnectError} — bridge / validation error.
     *
     * @returns The signed BoC plus, when available, the `traceId` the SDK
     *          propagated through the bridge.
     *
     * @see [Send a transaction (docs)](https://docs.ton.org/applications/ton-connect/how-to/send-transaction)
     */
    sendTransaction(
        transaction: SendTransactionRequest,
        options?: OptionalTraceable<{
            /** Called the moment the encrypted request is posted to the bridge. */
            onRequestSent?: () => void;
            signal?: AbortSignal;
        }>
    ): Promise<OptionalTraceable<SendTransactionResponse>>;

    /**
     * @deprecated Use `sendTransaction(transaction, options)` instead.
     *             Provided so existing dApps keep compiling.
     */
    sendTransaction(
        transaction: SendTransactionRequest,
        onRequestSent?: () => void
    ): Promise<OptionalTraceable<SendTransactionResponse>>;

    /**
     * Ask the connected wallet to sign opaque data ({@link SignDataPayload}).
     * The signature is bound to the user's wallet address, the dApp's domain,
     * a timestamp, and the payload — verify on the backend or on-chain.
     *
     * @throws {@link WalletNotConnectedError} — no wallet is connected.
     * @throws {@link WalletNotSupportFeatureError} — wallet does not advertise the
     *         requested `SignData.types`.
     * @throws {@link UserRejectsError} — user declined.
     * @throws {@link WalletWrongNetworkError} — wallet network differs from the request.
     * @throws {@link TonConnectError} — bridge / validation error.
     *
     * @returns The {@link SignDataResponse} plus, when available, the `traceId`
     *          the SDK propagated through the bridge.
     *
     * @see [Sign data (docs)](https://docs.ton.org/applications/ton-connect/how-to/sign-data)
     */
    signData(
        data: SignDataPayload,
        options?: OptionalTraceable<{
            onRequestSent?: () => void;
            signal?: AbortSignal;
        }>
    ): Promise<OptionalTraceable<SignDataResponse>>;

    /**
     * Ask the connected wallet to sign an internal message **without
     * broadcasting it**.
     *
     * Same payload shape as `sendTransaction`; supported by wallets that
     * advertise the `SignMessage` feature (typically Wallet V5).
     *
     * @throws {@link WalletNotConnectedError} — no wallet is connected.
     * @throws {@link WalletNotSupportFeatureError} — wallet does not advertise `SignMessage`.
     * @throws {@link UserRejectsError} — user declined.
     * @throws {@link WalletWrongNetworkError} — wallet network differs from the request.
     * @throws {@link TonConnectError} — bridge / validation error.
     *
     * @returns a signed BoC the dApp can wrap in an external
     * message and submit through a relayer (e.g. for a gasless jetton
     * transfer).
     *
     * @see [Sign and relay a message (gasless) (docs)](https://docs.ton.org/applications/ton-connect/how-to/sign-message-gasless)
     */
    signMessage(
        message: SignMessageRequest,
        options?: OptionalTraceable<{
            onRequestSent?: () => void;
            signal?: AbortSignal;
        }>
    ): Promise<OptionalTraceable<SignMessageResponse>>;

    /**
     * Current bridge session ID, or `null` if no session is open.
     */
    getSessionId(): Promise<string | null>;
}

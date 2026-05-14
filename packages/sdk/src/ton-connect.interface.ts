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
     * Returns the available wallets list. Implementations that wrap a remote
     * registry are expected to fall back to a bundled list on fetch failure,
     * so callers should not rely on this method rejecting with a
     * `FetchWalletsError`.
     */
    getWallets(): Promise<WalletInfo[]>;

    /**
     * Allows to subscribe to connection status changes and handle connection errors.
     * @param callback fires after the connection status changes, receiving the active wallet or null.
     * @param errorsHandler fires with a TonConnectError instance when a connect error is received.
     * @returns unsubscribe callback.
     */
    onStatusChange(
        callback: (walletInfo: Wallet | null) => void,
        errorsHandler?: (err: TonConnectError) => void
    ): () => void;

    /**
     * Generates universal link for an external wallet and subscribes to the wallet's bridge, or sends connect request to the injected wallet.
     * @param wallet wallet's bridge url and universal link for an external wallet or jsBridge key for the injected wallet, or list of bridges urls for creating an universal connection request for the corresponding wallets.
     * @param request additional request to pass to the wallet while connecting (currently only ton_proof is available).
     * @param options openingDeadlineMS sets the connection opening deadline; signal aborts the connection; embeddedRequest carries an optional embedded action to run on connect.
     * @returns universal link if external wallet was passed or void for the injected wallet.
     * @throws {@link WalletAlreadyConnectedError} a wallet is already connected — disconnect first.
     * @throws {@link TonConnectError} the connect-additional-request or embedded request failed validation, or the connection was aborted via `options.signal`.
     */
    connect<T extends WalletConnectionSource | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[]>(
        wallet: T,
        request?: ConnectAdditionalRequest,
        options?: OptionalTraceable<{
            openingDeadlineMS?: number;
            signal?: AbortSignal;
            embeddedRequest?: ConsumableLike<EmbeddedRequest>;
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
     * or if you use SDK with Node.js and want to save server resources.
     */
    pauseConnection(): void;

    /**
     * Unpause bridge HTTP connection if it is paused.
     */
    unPauseConnection(): Promise<void>;

    /**
     * Set desired network for the connection. Can only be set before connecting.
     * If the wallet connects with a different chain, the SDK throws an error and aborts the connection.
     * @param network desired network id (e.g., '-239', '-3', or custom). Pass undefined to allow any network.
     * @throws {@link TonConnectError} a wallet is already connected — disconnect before changing the desired network.
     */
    setConnectionNetwork(network?: ChainId): void;

    /**
     * Disconnect from the connected wallet and drop the current session.
     * @throws {@link WalletNotConnectedError} no wallet is currently connected.
     * @throws {@link TonConnectError} the request was aborted via `options.signal`.
     */
    disconnect(options?: OptionalTraceable<{ signal?: AbortSignal }>): Promise<void>;

    /**
     * Asks connected wallet to sign and send the transaction.
     * @param transaction transaction to send.
     * @param options onRequestSent fires after the transaction is sent; signal aborts the request.
     * @returns signed transaction boc that allows you to find the transaction in the blockchain.
     * @throws {@link WalletNotConnectedError} no wallet is currently connected.
     * @throws {@link WalletNotSupportFeatureError} the connected wallet does not advertise support for the requested transaction shape (messages, items, or extra currencies).
     * @throws {@link WalletWrongNetworkError} the wallet's `account.chain` differs from the network on `transaction`.
     * @throws {@link UserRejectsError} the user rejected the transaction in the wallet UI.
     * @throws {@link BadRequestError} the wallet rejected the request as malformed.
     * @throws {@link UnknownAppError} the wallet does not recognise this dApp session.
     * @throws {@link TonConnectError} `transaction` failed validation or the request was aborted via `options.signal`.
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

    /**
     * Asks the connected wallet to sign an arbitrary payload (text, binary, or
     * structured cell) and return the user's signature. The payload is not
     * broadcast to the blockchain — only signed.
     * @param data payload to sign. The `type` discriminator selects the
     *   payload form (`'text'`, `'binary'`, or `'cell'`).
     * @param options `onRequestSent` fires once the request has been
     *   dispatched to the wallet; `signal` aborts the in-flight signing
     *   request.
     * @returns the signed payload together with the signer address, the
     *   domain the dApp was opened under, and the wallet-stamped timestamp.
     * @throws {@link WalletNotConnectedError} no wallet is currently connected.
     * @throws {@link WalletNotSupportFeatureError} the connected wallet does not
     *   advertise support for the requested payload type via its `signData`
     *   feature.
     * @throws {@link WalletWrongNetworkError} the wallet's `account.chain` differs
     *   from the network on `data`.
     * @throws {@link UserRejectsError} the user rejected the request in the wallet UI.
     * @throws {@link BadRequestError} the wallet rejected the payload as malformed.
     * @throws {@link UnknownAppError} the wallet does not recognise this dApp session.
     * @throws {@link TonConnectError} `data` failed validation or the request was
     *   aborted via `options.signal`.
     */
    signData(
        data: SignDataPayload,
        options?: OptionalTraceable<{
            onRequestSent?: () => void;
            signal?: AbortSignal;
        }>
    ): Promise<OptionalTraceable<SignDataResponse>>;

    /**
     * Asks connected wallet to sign the message without sending it to the blockchain.
     * @param message message to sign (same structure as transaction).
     * @param options onRequestSent fires after the request is sent; signal aborts the request.
     * @returns signed internal message boc.
     * @throws {@link WalletNotConnectedError} no wallet is currently connected.
     * @throws {@link WalletNotSupportFeatureError} the connected wallet does not advertise support for the requested message shape via its `signMessage` feature.
     * @throws {@link WalletWrongNetworkError} the wallet's `account.chain` differs from the network on `message`.
     * @throws {@link UserRejectsError} the user rejected the request in the wallet UI.
     * @throws {@link BadRequestError} the wallet rejected the request as malformed.
     * @throws {@link UnknownAppError} the wallet does not recognise this dApp session.
     * @throws {@link TonConnectError} `message` failed validation or the request was aborted via `options.signal`.
     */
    signMessage(
        message: SignMessageRequest,
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
}

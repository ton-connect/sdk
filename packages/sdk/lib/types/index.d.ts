export declare interface Account {
    /**
     * User's address in "hex" format: "<wc>:<hex>".
     */
    address: string;
    /**
     * User's selected chain.
     */
    chain: CHAIN;
    /**
     * Base64 (not url safe) encoded wallet contract stateInit.
     * Can be used to get user's public key from the stateInit if the wallet contract doesn't support corresponding get method.
     */
    walletStateInit: string;
    /**
     * Hex string without 0x prefix.
     */
    publicKey?: string;
}

/**
 * Thrown when request to the wallet contains errors.
 */
export declare class BadRequestError extends TonConnectError {
    protected get info(): string;
    constructor(...args: ConstructorParameters<typeof TonConnectError>);
}

export declare enum CHAIN {
    MAINNET = "-239",
    TESTNET = "-3"
}

export declare enum CONNECT_ITEM_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    METHOD_NOT_SUPPORTED = 400
}

export declare interface ConnectAdditionalRequest {
    /**
     * Payload for ton_proof
     */
    tonProof?: string;
}

export declare type ConnectItemReplyError<T> = {
    name: T;
    error: {
        code: CONNECT_ITEM_ERROR_CODES;
        message?: string;
    };
};

export declare interface DappMetadata {
    /**
     * Dapp name. Might be simple, will not be used as identifier.
     * @default `document.title` if exists, 'Unknown dapp' overwise
     */
    name: string;
    /**
     * URL to the dapp icon. Must be PNG, ICO, ... . SVG icons are not supported.
     * @default best quality favicon declared via <link> in the document or '' if there are no any icons in the document.
     */
    icon: string;
    /**
     * Dapp URL. Will be used as the dapp identifier. Will be used to open the dapp after click to its icon in the wallet.
     * It is recommended to pass url without closing slash, e.g. 'https://mydapp.com' instead of 'https://mydapp.com/'.
     * @default `window.location.origin` if exists, otherwise (if not explicitly specified) an error will be thrown.
     */
    url: string;
}

export declare interface DeviceInfo {
    platform: 'iphone' | 'ipad' | 'android' | 'windows' | 'mac' | 'linux' | 'browser';
    appName: string;
    appVersion: string;
    maxProtocolVersion: number;
    features: Feature[];
}

export declare type Feature = SendTransactionFeatureDeprecated | SendTransactionFeature | SignDataFeature;

/**
 * Thrown when an error occurred while fetching the wallets list.
 */
export declare class FetchWalletsError extends TonConnectError {
    protected get info(): string;
    constructor(...args: ConstructorParameters<typeof TonConnectError>);
}

export declare function isTelegramUrl(link: string): boolean;

/**
 * Imitation of the localStorage.
 */
export declare interface IStorage {
    /**
     * Saves the `value` to the storage. Value can be accessed later by the `key`. Implementation may use backend as a storage due to the fact that the function returns a promise.
     * @param key key to access to the value later.
     * @param value value to save.
     */
    setItem(key: string, value: string): Promise<void>;
    /**
     * Reads the `value` from the storage. Implementation may use backend as a storage due to the fact that the function returns a promise.
     * @param key key to access the value.
     */
    getItem(key: string): Promise<string | null>;
    /**
     * Removes the `value` from the storage. Implementation may use backend as a storage due to the fact that the function returns a promise.
     * @param key key to access the value.
     */
    removeItem(key: string): Promise<void>;
}

/**
 * Checks if `WalletInfo` is `WalletInfoInjectable` and dApp is opened inside this wallet's browser.
 * @param value WalletInfo to check.
 */
export declare function isWalletInfoCurrentlyEmbedded(value: WalletInfo): value is WalletInfoCurrentlyEmbedded;

/**
 * Checks if `WalletInfo` is `WalletInfoInjectable` and `WalletInfo` is injected to the current webpage (`walletInfo.injected === true`).
 * @param value WalletInfo to check.
 */
export declare function isWalletInfoCurrentlyInjected(value: WalletInfo): value is WalletInfoCurrentlyInjected;

/**
 * Checks if `WalletInfo` is `WalletInfoInjected`, but doesn't check if it is injected to the page or not.
 * @param value WalletInfo to check.
 */
export declare function isWalletInfoInjectable(value: WalletInfo): value is WalletInfoInjectable;

/**
 * @deprecated use `isWalletInfoInjectable` or `isWalletInfoCurrentlyInjected` instead.
 * @param value WalletInfo to check.
 */
export declare function isWalletInfoInjected(value: WalletInfo): value is WalletInfoInjected;

/**
 * Checks if `WalletInfo` is `WalletInfoRemote`.
 * @param value WalletInfo to check.
 */
export declare function isWalletInfoRemote(value: WalletInfo): value is WalletInfoRemote;

export declare interface ITonConnect {
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
    onStatusChange(callback: (walletInfo: Wallet | null) => void, errorsHandler?: (err: TonConnectError) => void): () => void;
    /**
     * Generates universal link for an external wallet and subscribes to the wallet's bridge, or sends connect request to the injected wallet.
     * @param wallet wallet's bridge url and universal link for an external wallet or jsBridge key for the injected wallet, or list of bridges urls for creating an universal connection request for the corresponding wallets.
     * @param request (optional) additional request to pass to the wallet while connect (currently only ton_proof is available).
     * @returns universal link if external wallet was passed or void for the injected wallet.
     */
    connect<T extends WalletConnectionSource | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[]>(wallet: T, request?: ConnectAdditionalRequest): T extends WalletConnectionSourceJS ? void : string;
    /**
     * Try to restore existing session and reconnect to the corresponding wallet. Call it immediately when your app is loaded.
     */
    restoreConnection(): Promise<void>;
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
    disconnect(): Promise<void>;
    /**
     * Asks connected wallet to sign and send the transaction.
     * @param transaction transaction to send.
     * @returns signed transaction boc that allows you to find the transaction in the blockchain.
     * If user rejects transaction, method will throw the corresponding error.
     */
    sendTransaction(transaction: SendTransactionRequest): Promise<SendTransactionResponse>;
}

/**
 * Thrown when `Storage` was not specified in the `DappMetadata` and default `localStorage` was not detected in the environment.
 */
export declare class LocalstorageNotFoundError extends TonConnectError {
    protected get info(): string;
    constructor(...args: ConstructorParameters<typeof TonConnectError>);
}

/**
 * Thrown when passed hex is in incorrect format.
 */
export declare class ParseHexError extends TonConnectError {
    protected get info(): string;
    constructor(...args: ConstructorParameters<typeof TonConnectError>);
}

export declare type SendTransactionFeature = {
    name: 'SendTransaction';
    maxMessages: number;
};

export declare type SendTransactionFeatureDeprecated = 'SendTransaction';

export declare interface SendTransactionRequest {
    /**
     * Sending transaction deadline in unix epoch seconds.
     */
    validUntil: number;
    /**
     * The network (mainnet or testnet) where DApp intends to send the transaction. If not set, the transaction is sent to the network currently set in the wallet, but this is not safe and DApp should always strive to set the network. If the network parameter is set, but the wallet has a different network set, the wallet should show an alert and DO NOT ALLOW TO SEND this transaction.
     */
    network?: CHAIN;
    /**
     * The sender address in '<wc>:<hex>' format from which DApp intends to send the transaction. Current account.address by default.
     */
    from?: string;
    /**
     * Messages to send: min is 1, max is 4.
     */
    messages: {
        /**
         * Receiver's address.
         */
        address: string;
        /**
         * Amount to send in nanoTon.
         */
        amount: string;
        /**
         * Contract specific data to add to the transaction.
         */
        stateInit?: string;
        /**
         * Contract specific data to add to the transaction.
         */
        payload?: string;
    }[];
}

export declare interface SendTransactionResponse {
    /**
     * Signed boc
     */
    boc: string;
}

export declare type SignDataFeature = {
    name: 'SignData';
};

declare class TonConnect implements ITonConnect {
    private static readonly walletsList;
    /**
     * Check if specified wallet is injected and available to use with the app.
     * @param walletJSKey target wallet's js bridge key.
     */
    static isWalletInjected: (walletJSKey: string) => boolean;
    /**
     * Check if the app is opened inside specified wallet's browser.
     * @param walletJSKey target wallet's js bridge key.
     */
    static isInsideWalletBrowser: (walletJSKey: string) => boolean;
    /**
     * Returns available wallets list.
     */
    static getWallets(): Promise<WalletInfo[]>;
    private readonly walletsList;
    private readonly dappSettings;
    private readonly bridgeConnectionStorage;
    private _wallet;
    private provider;
    private statusChangeSubscriptions;
    private statusChangeErrorSubscriptions;
    /**
     * Shows if the wallet is connected right now.
     */
    get connected(): boolean;
    /**
     * Current connected account or null if no account is connected.
     */
    get account(): Account | null;
    /**
     * Current connected wallet or null if no account is connected.
     */
    get wallet(): Wallet | null;
    private set wallet(value);
    constructor(options?: TonConnectOptions);
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
    onStatusChange(callback: (wallet: Wallet | null) => void, errorsHandler?: (err: TonConnectError) => void): () => void;
    /**
     * Generates universal link for an external wallet and subscribes to the wallet's bridge, or sends connect request to the injected wallet.
     * @param wallet wallet's bridge url and universal link for an external wallet or jsBridge key for the injected wallet.
     * @param request (optional) additional request to pass to the wallet while connect (currently only ton_proof is available).
     * @returns universal link if external wallet was passed or void for the injected wallet.
     */
    connect<T extends WalletConnectionSource | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[]>(wallet: T, request?: ConnectAdditionalRequest): T extends WalletConnectionSourceJS ? void : string;
    /**
     * Try to restore existing session and reconnect to the corresponding wallet. Call it immediately when your app is loaded.
     */
    restoreConnection(): Promise<void>;
    /**
     * Asks connected wallet to sign and send the transaction.
     * @param transaction transaction to send.
     * @returns signed transaction boc that allows you to find the transaction in the blockchain.
     * If user rejects transaction, method will throw the corresponding error.
     */
    sendTransaction(transaction: SendTransactionRequest): Promise<SendTransactionResponse>;
    /**
     * Disconnect form thw connected wallet and drop current session.
     */
    disconnect(): Promise<void>;
    /**
     * Pause bridge HTTP connection. Might be helpful, if you want to pause connections while browser tab is unfocused,
     * or if you use SDK with NodeJS and want to save server resources.
     */
    pauseConnection(): void;
    /**
     * Unpause bridge HTTP connection if it is paused.
     */
    unPauseConnection(): Promise<void>;
    private addWindowFocusAndBlurSubscriptions;
    private createProvider;
    private walletEventsListener;
    private onWalletConnected;
    private onWalletConnectError;
    private onWalletDisconnected;
    private checkConnection;
    private createConnectRequest;
}
export { TonConnect }
export default TonConnect;

/**
 * Base class for TonConnect errors. You can check if the error was triggered by the @tonconnect/sdk using `err instanceof TonConnectError`.
 */
export declare class TonConnectError extends Error {
    private static prefix;
    protected get info(): string;
    constructor(message?: string, options?: {
        cause?: unknown;
    });
}

/**
 * TonConnect constructor options
 */
export declare interface TonConnectOptions {
    /**
     * Url to the [manifest]{@link https://github.com/ton-connect/docs/blob/main/requests-responses.md#app-manifest} with the Dapp metadata that will be displayed in the user's wallet.
     * If not passed, manifest from `${window.location.origin}/tonconnect-manifest.json` will be taken.
     */
    manifestUrl?: string;
    /**
     * Storage to save protocol data. For browser default is `localStorage`. If you use SDK with nodeJS, you have to specify this field.
     */
    storage?: IStorage;
    /**
     * Redefine wallets list source URL. Must be a link to a json file with [following structure]{@link https://github.com/ton-connect/wallets-list}
     * @default https://raw.githubusercontent.com/ton-connect/wallets-list/main/wallets.json
     * @
     */
    walletsListSource?: string;
    /**
     * Wallets list cache time to live
     * @default Infinity
     */
    walletsListCacheTTLMs?: number;
    /**
     * Allows to disable auto pause/unpause SSE connection on 'document.visibilitychange' event. It is not recommended to change default behaviour.
     */
    disableAutoPauseConnection?: boolean;
}

export declare type TonProofItemReply = TonProofItemReplySuccess | TonProofItemReplyError;

export declare type TonProofItemReplyError = ConnectItemReplyError<TonProofItemReplySuccess['name']>;

export declare interface TonProofItemReplySuccess {
    name: 'ton_proof';
    proof: {
        timestamp: number;
        domain: {
            lengthBytes: number;
            value: string;
        };
        payload: string;
        signature: string;
    };
}

/**
 * Converts raw TON address to bounceable user-friendly format. [See details]{@link https://ton.org/docs/learn/overviews/addresses#user-friendly-address}
 * @param hexAddress raw TON address formatted as "0:<hex string without 0x>".
 * @param [testOnly=false] convert address to test-only form. [See details]{@link https://ton.org/docs/learn/overviews/addresses#user-friendly-address}
 */
export declare function toUserFriendlyAddress(hexAddress: string, testOnly?: boolean): string;

/**
 * Thrown when app tries to send rpc request to the injected wallet while not connected.
 */
export declare class UnknownAppError extends TonConnectError {
    protected get info(): string;
    constructor(...args: ConstructorParameters<typeof TonConnectError>);
}

/**
 * Unhanded unknown error.
 */
export declare class UnknownError extends TonConnectError {
    constructor(...args: ConstructorParameters<typeof TonConnectError>);
}

/**
 * Thrown when user rejects the action in the wallet.
 */
export declare class UserRejectsError extends TonConnectError {
    protected get info(): string;
    constructor(...args: ConstructorParameters<typeof TonConnectError>);
}

export declare interface Wallet {
    /**
     * Information about user's wallet's device.
     */
    device: DeviceInfo;
    /**
     * Provider type: http bridge or injected js.
     */
    provider: 'http' | 'injected';
    /**
     * Selected account.
     */
    account: Account;
    /**
     * Response for connect items request.
     */
    connectItems?: {
        tonProof?: TonProofItemReply;
    };
}

/**
 * Thrown when wallet connection called but wallet already connected. To avoid the error, disconnect the wallet before doing a new connection.
 */
export declare class WalletAlreadyConnectedError extends TonConnectError {
    protected get info(): string;
    constructor(...args: ConstructorParameters<typeof TonConnectError>);
}

export declare type WalletConnectionSource = WalletConnectionSourceHTTP | WalletConnectionSourceJS;

export declare interface WalletConnectionSourceHTTP {
    /**
     * Base part of the wallet universal url. The link should support [Ton Connect parameters]{@link https://github.com/ton-connect/docs/blob/main/bridge.md#universal-link}.
     */
    universalLink: string;
    /**
     * Url of the wallet's implementation of the [HTTP bridge]{@link https://github.com/ton-connect/docs/blob/main/bridge.md#http-bridge}.
     */
    bridgeUrl: string;
}

export declare interface WalletConnectionSourceJS {
    /**
     * If the wallet handles JS Bridge connection, specifies the binding for the bridge object accessible through window. Example: the key "tonkeeper" means the bridge can be accessed as window.tonkeeper.
     */
    jsBridgeKey: string;
}

export declare type WalletInfo = WalletInfoRemote | WalletInfoInjectable | (WalletInfoRemote & WalletInfoInjectable);

/**
 * Common information for injectable and http-compatible wallets.
 */
export declare interface WalletInfoBase {
    /**
     * Human-readable name of the wallet.
     */
    name: string;
    /**
     * ID of the wallet, equals to the `appName` property into {@link Wallet.device}.
     */
    appName: string;
    /**
     * Url to the icon of the wallet. Resolution 288×288px. On non-transparent background, without rounded corners. PNG format.
     */
    imageUrl: string;
    /**
     * Will be used in the protocol later.
     */
    tondns?: string;
    /**
     * Info or landing page of your wallet. May be useful for TON newcomers.
     */
    aboutUrl: string;
    /**
     * OS and browsers where the wallet could be installed
     */
    platforms: ('ios' | 'android' | 'macos' | 'windows' | 'linux' | 'chrome' | 'firefox' | 'safari')[];
}

/**
 * Information about the JS-injectable wallet in the browser of which the dApp is opened.
 */
export declare interface WalletInfoCurrentlyEmbedded extends WalletInfoCurrentlyInjected {
    injected: true;
    embedded: true;
}

/**
 * Information about the JS-injectable wallet that is injected to the current webpage.
 */
export declare interface WalletInfoCurrentlyInjected extends WalletInfoInjectable {
    injected: true;
}

/**
 * JS-injectable wallet information.
 */
export declare interface WalletInfoInjectable extends WalletInfoBase {
    /**
     * If the wallet handles JS Bridge connection, specifies the binding for the bridge object accessible through window. Example: the key "tonkeeper" means the bridge can be accessed as window.tonkeeper.
     */
    jsBridgeKey: string;
    /**
     * Indicates if the wallet currently is injected to the webpage.
     */
    injected: boolean;
    /**
     * Indicates if the dapp is opened inside this wallet's browser.
     */
    embedded: boolean;
}

/**
 * @deprecated Use `WalletInfoInjectable` or `WalletInfoCurrentlyInjected` instead.
 */
export declare interface WalletInfoInjected extends WalletInfoBase {
    jsBridgeKey: string;
    injected: boolean;
    embedded: boolean;
}

/**
 * Http-compatible wallet information.
 */
export declare interface WalletInfoRemote extends WalletInfoBase {
    /**
     * Base part of the wallet universal url. The link should support [Ton Connect parameters]{@link https://github.com/ton-connect/docs/blob/main/bridge.md#universal-link}.
     */
    universalLink: string;
    /**
     * Native wallet app deepLink. The link should support [Ton Connect parameters]{@link https://github.com/ton-connect/docs/blob/main/bridge.md#universal-link}.
     */
    deepLink?: string;
    /**
     * Url of the wallet's implementation of the [HTTP bridge]{@link https://github.com/ton-connect/docs/blob/main/bridge.md#http-bridge}.
     */
    bridgeUrl: string;
}

/**
 * Thrown when send transaction or other protocol methods called while wallet is not connected.
 */
export declare class WalletNotConnectedError extends TonConnectError {
    protected get info(): string;
    constructor(...args: ConstructorParameters<typeof TonConnectError>);
}

/**
 * Thrown when there is an attempt to connect to the injected wallet while it is not exists in the webpage.
 */
export declare class WalletNotInjectedError extends TonConnectError {
    protected get info(): string;
    constructor(...args: ConstructorParameters<typeof TonConnectError>);
}

export declare class WalletsListManager {
    private walletsListCache;
    private walletsListCacheCreationTimestamp;
    private readonly cacheTTLMs;
    private readonly walletsListSource;
    constructor(options?: {
        walletsListSource?: string;
        cacheTTLMs?: number;
    });
    getWallets(): Promise<WalletInfo[]>;
    getEmbeddedWallet(): Promise<WalletInfoCurrentlyEmbedded | null>;
    private fetchWalletsList;
    private walletConfigDTOListToWalletConfigList;
    private mergeWalletsLists;
    private isCorrectWalletConfigDTO;
}

/**
 * Thrown when passed address is in incorrect format.
 */
export declare class WrongAddressError extends TonConnectError {
    protected get info(): string;
    constructor(...args: ConstructorParameters<typeof TonConnectError>);
}

export { }

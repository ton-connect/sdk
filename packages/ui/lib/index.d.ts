import { WalletInfoBase, WalletInfoInjectable, WalletInfoRemote, ITonConnect, Wallet, WalletInfo, Account, ConnectAdditionalRequest, TonConnectError, SendTransactionRequest, SendTransactionResponse } from '@tonconnect/sdk';
export * from '@tonconnect/sdk';
import { Property } from 'csstype';

declare type Locales = 'en' | 'ru';

declare enum THEME {
    DARK = "DARK",
    LIGHT = "LIGHT"
}
declare type Theme = THEME | 'SYSTEM';

declare type BorderRadius = 'm' | 's' | 'none';

declare type Color$1 = Property.Color;
declare type ColorsSet = {
    constant: {
        black: Color$1;
        white: Color$1;
    };
    connectButton: {
        background: Color$1;
        foreground: Color$1;
    };
    accent: Color$1;
    telegramButton: Color$1;
    icon: {
        primary: Color$1;
        secondary: Color$1;
        tertiary: Color$1;
        success: Color$1;
        error: Color$1;
    };
    background: {
        primary: Color$1;
        secondary: Color$1;
        segment: Color$1;
        tint: Color$1;
        qr: Color$1;
    };
    text: {
        primary: Color$1;
        secondary: Color$1;
    };
};
declare type PartialColorsSet = {
    constant?: {
        black?: Color$1;
        white?: Color$1;
    };
    connectButton?: {
        background?: Color$1;
        foreground?: Color$1;
    };
    accent?: Color$1;
    telegramButton?: Color$1;
    icon?: {
        primary?: Color$1;
        secondary?: Color$1;
        tertiary?: Color$1;
        success?: Color$1;
        error?: Color$1;
    };
    background?: {
        primary?: Color$1;
        secondary?: Color$1;
        segment?: Color$1;
        tint?: Color$1;
        qr?: Color$1;
    };
    text?: {
        primary?: Color$1;
        secondary?: Color$1;
    };
};

interface UIPreferences {
    /**
     * Color theme for the UI elements.
     * @default SYSTEM theme.
     */
    theme?: Theme;
    /**
     * Border radius for UI elements.
     * @default 'm'
     */
    borderRadius?: BorderRadius;
    /**
     * Configure colors scheme for different themes.
     */
    colorsSet?: Partial<Record<THEME, PartialColorsSet>>;
}

declare type UIWallet = WalletInfoBase & (Omit<WalletInfoInjectable, 'injected' | 'embedded'> | WalletInfoRemote);

/**
 * Add corrections to the default wallets list in the modal: add custom wallets and change wallets order.
 */
declare type WalletsListConfiguration = {
    /**
     * Allows to include extra wallets to the wallets list in the modal.
     */
    includeWallets?: UIWallet[];
};

/**
 * Specifies return strategy for the deeplink when user signs/declines the request.
 * [See details]{@link https://github.com/ton-connect/docs/blob/main/bridge.md#universal-link}.
 */
declare type ReturnStrategy = 'back' | 'none' | `${string}://${string}`;

interface ActionConfiguration {
    /**
     * Configure action modals behavior.
     * @default ['before']
     */
    modals?: ('before' | 'success' | 'error')[] | 'all';
    /**
     * Configure action notifications behavior.
     * @default 'all'
     */
    notifications?: ('before' | 'success' | 'error')[] | 'all';
    /**
     * Specifies return strategy for the deeplink when user signs/declines the request.
     * @default 'back'
     */
    returnStrategy?: ReturnStrategy;
    /**
     * Specifies whether the method should redirect user to the connected wallet
     * @default 'ios'
     */
    skipRedirectToWallet?: 'ios' | 'always' | 'never';
}

interface TonConnectUiOptions {
    /**
     * UI elements configuration.
     */
    uiPreferences?: UIPreferences;
    /**
     * HTML element id to attach the wallet connect button. If not passed button won't appear.
     * @default null.
     */
    buttonRootId?: string | null;
    /**
     * Language for the phrases it the UI elements.
     * @default system
     */
    language?: Locales;
    /**
     * Configuration for the wallets list in the connect wallet modal.
     */
    walletsListConfiguration?: WalletsListConfiguration;
    /**
     * Configuration for action-period (e.g. sendTransaction) UI elements: modals and notifications and wallet behaviour (return strategy).
     */
    actionsConfiguration?: ActionConfiguration;
}

declare type TonConnectUiCreateOptions = TonConnectUiOptionsWithConnector | TonConnectUiOptionsWithManifest;
interface TonConnectUiOptionsWithManifest extends TonConnectUiCreateOptionsBase {
    /**
     * Url to the [manifest]{@link https://github.com/ton-connect/docs/blob/main/requests-responses.md#app-manifest} with the Dapp metadata that will be displayed in the user's wallet.
     * If not passed, manifest from `${window.location.origin}/tonconnect-manifest.json` will be taken.
     */
    manifestUrl?: string;
}
interface TonConnectUiOptionsWithConnector extends TonConnectUiCreateOptionsBase {
    /**
     * TonConnect instance. Can be helpful if you use custom ITonConnect implementation, or use both of @tonconnect/sdk and @tonconnect/ui in your app.
     */
    connector?: ITonConnect;
}
interface TonConnectUiCreateOptionsBase extends TonConnectUiOptions {
    /**
     * Try to restore existing session and reconnect to the corresponding wallet.
     * @default true.
     */
    restoreConnection?: boolean;
    /**
     * HTML element id to attach the modal window element. If not passed, `div#tc-widget-root` in the end of the <body> will be added and used.
     * @default `div#tc-widget-root`.
     */
    widgetRootId?: string;
}

declare type WalletOpenMethod = 'qrcode' | 'universal-link';
declare type WalletInfoWithOpenMethod = WalletInfoInjectable | WalletInfoRemoteWithOpenMethod | (WalletInfoInjectable & WalletInfoRemoteWithOpenMethod);
declare type WalletInfoRemoteWithOpenMethod = WalletInfoRemote & {
    openMethod?: WalletOpenMethod;
};
declare type ConnectedWallet = Wallet & WalletInfoWithOpenMethod;

declare type Loadable<T> = LoadableLoading | LoadableReady<T>;
declare type LoadableLoading = {
    state: 'loading';
};
declare type LoadableReady<T> = {
    state: 'ready';
    value: T;
};

declare class TonConnectUI {
    static getWallets(): Promise<WalletInfo[]>;
    private readonly walletInfoStorage;
    private readonly preferredWalletStorage;
    readonly connector: ITonConnect;
    private walletInfo;
    private systemThemeChangeUnsubscribe;
    private actionsConfiguration?;
    private readonly walletsList;
    private connectRequestParametersCallback?;
    /**
     * Promise that resolves after end of th connection restoring process (promise will fire after `onStatusChange`, so you can get actual information about wallet and session after when promise resolved).
     * Resolved value `true`/`false` indicates if the session was restored successfully.
     */
    readonly connectionRestored: Promise<boolean>;
    /**
     * Current connection status.
     */
    get connected(): boolean;
    /**
     * Current connected account or null.
     */
    get account(): Account | null;
    /**
     * Curren connected wallet app and its info or null.
     */
    get wallet(): Wallet | (Wallet & WalletInfoWithOpenMethod) | null;
    /**
     * Set and apply new UI options. Object with partial options should be passed. Passed options will be merged with current options.
     * @param options
     */
    set uiOptions(options: TonConnectUiOptions);
    constructor(options?: TonConnectUiCreateOptions);
    /**
     * Use it to customize ConnectRequest and add `tonProof` payload.
     * You can call it multiply times to set updated tonProof payload if previous one is outdated.
     * If `connectRequestParameters.state === 'loading'` loader will appear instead of the qr code in the wallets modal.
     * If `connectRequestParameters.state` was changed to 'ready' or it's value has been changed, QR will be re-rendered.
     */
    setConnectRequestParameters(connectRequestParameters: Loadable<ConnectAdditionalRequest> | undefined | null): void;
    /**
     * Returns available wallets list.
     */
    getWallets(): Promise<WalletInfo[]>;
    /**
     * Subscribe to connection status change.
     * @return function which has to be called to unsubscribe.
     */
    onStatusChange(callback: (wallet: ConnectedWallet | null) => void, errorsHandler?: (err: TonConnectError) => void): ReturnType<ITonConnect['onStatusChange']>;
    /**
     * Opens the modal window and handles a wallet connection.
     */
    connectWallet(): Promise<ConnectedWallet>;
    /**
     * Disconnect wallet and clean localstorage.
     */
    disconnect(): Promise<void>;
    /**
     * Opens the modal window and handles the transaction sending.
     * @param tx transaction to send.
     * @param options modal and notifications behaviour settings. Default is show only 'before' modal and all notifications.
     */
    sendTransaction(tx: SendTransactionRequest, options?: ActionConfiguration): Promise<SendTransactionResponse>;
    private subscribeToWalletChange;
    private setPreferredWalletAppName;
    private getSelectedWalletInfo;
    private updateWalletInfo;
    private normalizeWidgetRoot;
    private checkButtonRootExist;
    private getModalsAndNotificationsConfiguration;
}

declare type Color = Property.Color;

declare class TonConnectUIError extends TonConnectError {
    constructor(...args: ConstructorParameters<typeof Error>);
}

export { ActionConfiguration, BorderRadius, Color, ColorsSet, ConnectedWallet, Loadable, LoadableLoading, LoadableReady, Locales, PartialColorsSet, ReturnStrategy, THEME, Theme, TonConnectUI, TonConnectUIError, TonConnectUiCreateOptions, TonConnectUiCreateOptionsBase, TonConnectUiOptions, TonConnectUiOptionsWithConnector, TonConnectUiOptionsWithManifest, UIPreferences, UIWallet, WalletInfoRemoteWithOpenMethod, WalletInfoWithOpenMethod, WalletOpenMethod, WalletsListConfiguration };

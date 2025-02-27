import { Feature } from "@tonconnect/protocol";

/**
 * Common information for injectable and http-compatible wallets.
 */
export interface WalletInfoBase {
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
     * List of features supported by the wallet.
     */
    features?: Feature[];

    /**
     * Indicates if the wallet supports required features.
     */
    isSupportRequiredFeatures: boolean;

    /**
     * OS and browsers where the wallet could be installed
     */
    platforms: (
        | 'ios'
        | 'android'
        | 'macos'
        | 'windows'
        | 'linux'
        | 'chrome'
        | 'firefox'
        | 'safari'
    )[];
}

/**
 * Http-compatible wallet information.
 */
export interface WalletInfoRemote extends WalletInfoBase {
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
 * JS-injectable wallet information.
 */
export interface WalletInfoInjectable extends WalletInfoBase {
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
 * Information about the JS-injectable wallet that is injected to the current webpage.
 */
export interface WalletInfoCurrentlyInjected extends WalletInfoInjectable {
    injected: true;
}

/**
 * Information about the JS-injectable wallet in the browser of which the dApp is opened.
 */
export interface WalletInfoCurrentlyEmbedded extends WalletInfoCurrentlyInjected {
    injected: true;

    embedded: true;
}

/**
 * @deprecated Use `WalletInfoInjectable` or `WalletInfoCurrentlyInjected` instead.
 */
export interface WalletInfoInjected extends WalletInfoBase {
    jsBridgeKey: string;
    injected: boolean;
    embedded: boolean;
}

export type WalletInfo =
    | WalletInfoRemote
    | WalletInfoInjectable
    | (WalletInfoRemote & WalletInfoInjectable);

export interface WalletInfoDTO {
    name: string;
    app_name: string;
    image: string;
    tondns?: string;
    about_url: string;
    universal_url?: string;
    features?: Feature[];
    platforms: (
        | 'ios'
        | 'android'
        | 'macos'
        | 'windows'
        | 'linux'
        | 'chrome'
        | 'firefox'
        | 'safari'
    )[];

    deepLink?: string;
    bridge: (WalletInfoBridgeRemoteDTO | WalletInfoBridgeInjectedDTO)[];
}

export interface WalletInfoBridgeRemoteDTO {
    type: 'sse';
    url: string;
}

export interface WalletInfoBridgeInjectedDTO {
    type: 'js';
    key: string;
}

/**
 * Checks if `WalletInfo` is `WalletInfoInjectable` and `WalletInfo` is injected to the current webpage (`walletInfo.injected === true`).
 * @param value WalletInfo to check.
 */
export function isWalletInfoCurrentlyInjected(
    value: WalletInfo
): value is WalletInfoCurrentlyInjected {
    return isWalletInfoInjectable(value) && value.injected;
}

/**
 * Checks if `WalletInfo` is `WalletInfoInjectable` and dApp is opened inside this wallet's browser.
 * @param value WalletInfo to check.
 */
export function isWalletInfoCurrentlyEmbedded(
    value: WalletInfo
): value is WalletInfoCurrentlyEmbedded {
    return isWalletInfoCurrentlyInjected(value) && value.embedded;
}

/**
 * Checks if `WalletInfo` is `WalletInfoInjected`, but doesn't check if it is injected to the page or not.
 * @param value WalletInfo to check.
 */
export function isWalletInfoInjectable(value: WalletInfo): value is WalletInfoInjectable {
    return 'jsBridgeKey' in value;
}

/**
 * Checks if `WalletInfo` is `WalletInfoRemote`.
 * @param value WalletInfo to check.
 */
export function isWalletInfoRemote(value: WalletInfo): value is WalletInfoRemote {
    return 'bridgeUrl' in value;
}

/**
 * @deprecated use `isWalletInfoInjectable` or `isWalletInfoCurrentlyInjected` instead.
 * @param value WalletInfo to check.
 */
export function isWalletInfoInjected(value: WalletInfo): value is WalletInfoInjected {
    return 'jsBridgeKey' in value;
}

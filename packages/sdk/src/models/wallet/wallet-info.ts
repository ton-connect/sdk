import { Feature } from '@tonconnect/protocol';

/**
 * Common fields shared by every wallet returned from the wallets list.
 *
 * @see [Wallets list (spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/wallets-list.md)
 */
export interface WalletInfoBase {
    /** Human-readable display name shown in the wallet picker. */
    name: string;

    /**
     * Wallet identifier — equals the {@link DeviceInfo.appName} reported by the
     * connected {@link Wallet} at runtime.
     */
    appName: string;

    /**
     * HTTPS URL of the wallet icon. 288×288 PNG on a non-transparent
     * background, no rounded corners.
     */
    imageUrl: string;

    tondns?: string;

    /** Info or landing page for the wallet — shown to new users. */
    aboutUrl: string;

    /**
     * Wallet capabilities advertised in the registry.
     */
    features?: Feature[];

    /** Operating systems / browsers the wallet supports. */
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
 * Wallet reached over the HTTP (SSE) bridge.
 */
export interface WalletInfoRemote extends WalletInfoBase {
    /**
     * HTTPS base of the wallet's universal link. The SDK appends the connect
     * parameters (`v`, `id`, `r`, optional `ret`, `trace_id`, `e`).
     */
    universalLink: string;

    /**
     * Optional custom-scheme deep link (e.g. `tonkeeper-tc://`). Same protocol
     * parameters as the universal link.
     */
    deepLink?: string;

    /** URL of the wallet's HTTP (SSE) bridge endpoint. */
    bridgeUrl: string;
}

/**
 * Wallet exposed through a JS bridge — typically a browser extension, or the
 * dApp running inside the wallet's webview.
 */
export interface WalletInfoInjectable extends WalletInfoBase {
    /**
     * `window` property name where the wallet exposes its `TonConnectBridge`
     * object. `key: 'tonkeeper'` → `window.tonkeeper.tonconnect`.
     */
    jsBridgeKey: string;

    /** `true` when the wallet is injected into the current page. */
    injected: boolean;

    /** `true` when the dApp is running inside this wallet's in-app browser. */
    embedded: boolean;
}

/**
 * {@link WalletInfoInjectable} narrowed to wallets actually injected on the
 * current page. Filter the wallets list with {@link isWalletInfoCurrentlyInjected}.
 */
export interface WalletInfoCurrentlyInjected extends WalletInfoInjectable {
    injected: true;
}

/**
 * {@link WalletInfoCurrentlyInjected} narrowed to the case where the dApp is
 * running inside the wallet's webview. Detect with {@link isWalletInfoCurrentlyEmbedded}.
 *
 * When the dApp boots inside a wallet, prefer connecting via this entry rather
 * than showing a QR-code modal.
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

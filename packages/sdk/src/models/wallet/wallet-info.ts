export interface WalletInfoBase {
    /**
     * Name of the wallet.
     */
    name: string;

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
}

export interface WalletInfoRemote extends WalletInfoBase {
    /**
     * Base part of the wallet universal url. The link should support [Ton Connect parameters]{@link https://github.com/ton-connect/docs/blob/main/bridge.md#universal-link}.
     */
    universalLink: string;

    /**
     * Native wallet app deepLink. The link should support [Ton Connect parameters]{@link https://github.com/ton-connect/docs/blob/main/bridge.md#universal-link}.
     */
    deepLink: string;

    /**
     * Url of the wallet's implementation of the [HTTP bridge]{@link https://github.com/ton-connect/docs/blob/main/bridge.md#http-bridge}.
     */
    bridgeUrl: string;
}

export interface WalletInfoInjected extends WalletInfoBase {
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

export type WalletInfo =
    | WalletInfoRemote
    | WalletInfoInjected
    | (WalletInfoRemote & WalletInfoInjected);

export interface WalletInfoDTO {
    name: string;
    image: string;
    tondns?: string;
    about_url: string;
    universal_url: string;

    deepLink: string;
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

export function isWalletInfoInjected(value: WalletInfo): value is WalletInfoInjected {
    return 'jsBridgeKey' in value;
}

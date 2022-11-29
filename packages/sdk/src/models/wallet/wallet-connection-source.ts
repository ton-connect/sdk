export type WalletConnectionSource = WalletConnectionSourceHTTP | WalletConnectionSourceJS;

export interface WalletConnectionSourceHTTP {
    /**
     * Base part of the wallet universal url. The link should support [Ton Connect parameters]{@link https://github.com/ton-connect/docs/blob/main/bridge.md#universal-link}.
     */
    universalLink: string;

    /**
     * Url of the wallet's implementation of the [HTTP bridge]{@link https://github.com/ton-connect/docs/blob/main/bridge.md#http-bridge}.
     */
    bridgeUrl: string;
}

export interface WalletConnectionSourceJS {
    /**
     * If the wallet handles JS Bridge connection, specifies the binding for the bridge object accessible through window. Example: the key "tonkeeper" means the bridge can be accessed as window.tonkeeper.
     */
    jsBridgeKey: string;
}

export function isWalletConnectionSourceJS(
    value: WalletConnectionSource
): value is WalletConnectionSourceJS {
    return 'jsBridgeKey' in value;
}

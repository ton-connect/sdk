export type WalletConnectionSource = WalletConnectionSourceHTTP | WalletConnectionSourceJS;

export interface WalletConnectionSourceHTTP {
    universalLink: string;
    bridgeUrl: string;
}

export interface WalletConnectionSourceJS {
    jsBridgeKey: string;
}

export function isWalletConnectionSourceJS(
    value: WalletConnectionSource
): value is WalletConnectionSourceJS {
    return 'jsBridgeKey' in value;
}

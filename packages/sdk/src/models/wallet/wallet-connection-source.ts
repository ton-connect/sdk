/**
 * Selector passed to `ITonConnect.connect()` that tells the SDK *how* to reach
 * a specific wallet. Discriminated union of the three transports the protocol
 * supports.
 *
 * @see [`bridge.md` (Bridge spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/bridge.md)
 */
export type WalletConnectionSource =
    | WalletConnectionSourceHTTP
    | WalletConnectionSourceJS
    | WalletConnectionSourceWalletConnect;

/**
 * Connect via the wallet's HTTP (SSE) bridge plus a universal link.
 *
 * Both fields are sourced from the wallets list entry — see
 * [`wallets-list.md`](https://github.com/ton-blockchain/ton-connect/blob/main/spec/wallets-list.md).
 */
export interface WalletConnectionSourceHTTP {
    /**
     * HTTPS base of the wallet's universal link, e.g.
     * `'https://app.tonkeeper.com/ton-connect'`. The SDK appends the connect
     * parameters (`v`, `id`, `r`, optional `ret`, `trace_id`, `e`).
     */
    universalLink: string;

    /**
     * URL of the wallet's HTTP (SSE) bridge, e.g.
     * `'https://connect.ton.org/bridge'`.
     */
    bridgeUrl: string;
}

/**
 * Connect via an injected JS bridge — the wallet is a browser extension or the
 * dApp is running inside the wallet's webview.
 */
export interface WalletConnectionSourceJS {
    /**
     * Name of the `window` property where the wallet exposes its
     * `TonConnectBridge` object. For example, `jsBridgeKey: 'tonkeeper'`
     * resolves to `window.tonkeeper.tonconnect`.
     */
    jsBridgeKey: string;
}

/** Narrows to {@link WalletConnectionSourceJS}. */
export function isWalletConnectionSourceJS(
    value: WalletConnectionSource
): value is WalletConnectionSourceJS {
    return 'jsBridgeKey' in value;
}

/**
 * Connect via the WalletConnect transport. Requires {@link initializeWalletConnect}
 * to have been called once at app startup.
 */
export interface WalletConnectionSourceWalletConnect {
    type: 'wallet-connect';
}

/** Narrows to {@link WalletConnectionSourceWalletConnect}. */
export function isWalletConnectionSourceWalletConnect(
    value: WalletConnectionSource
): value is WalletConnectionSourceWalletConnect {
    return 'type' in value && value.type === 'wallet-connect';
}

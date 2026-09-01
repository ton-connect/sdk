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

/**
 * How a connection was initiated, derived from what was handed to `connect()`.
 *
 * Values are prefixed by transport so the transport axis stays recoverable — `js-*` covers the
 * injected JS bridge, `http-*` the HTTP (SSE) bridge — while the suffix carries what actually
 * differs within it.
 *
 * - `js-embedded` — the dApp is running inside this wallet's own browser.
 * - `js-injected` — the wallet exposes a JS bridge on the page, typically an extension.
 * - `http-specific-wallet` — one named wallet, reached via its own bridge and universal link.
 * - `http-any-wallet` — the universal `tc://` link, which any wallet can answer; none chosen yet.
 * - `wallet-connect` — the WalletConnect transport.
 *
 * `embedded` and `injected` share the {@link WalletConnectionSourceJS} shape, so the shape alone
 * cannot separate them — see {@link describeWalletConnectionSource}.
 */
export type WalletConnectionSourceKind =
    | 'js-embedded'
    | 'js-injected'
    | 'http-specific-wallet'
    | 'http-any-wallet'
    | 'wallet-connect';

/** What {@link describeWalletConnectionSource} could determine about a connection source. */
export interface WalletConnectionSourceInfo {
    kind: WalletConnectionSourceKind;

    /** Set for `js-embedded` and `js-injected`. */
    jsBridgeKey?: string;

    /** Set for `http-specific-wallet`. */
    bridgeUrl?: string;
}

/**
 * Classifies a connection source for analytics. Pure — the caller supplies the one piece of
 * information the source shape cannot carry.
 *
 * Ordering mirrors `createProvider()` in `ton-connect.ts` so the two cannot drift: the array case
 * first, then the two guarded shapes, with HTTP as the fallthrough (there is deliberately no
 * `isWalletConnectionSourceHTTP` guard in this module).
 *
 * @param source - the value passed to `connect()`.
 * @param isInsideWalletBrowser - whether the dApp is running inside the named wallet's browser,
 * which is what separates `embedded` from `injected`. Passed in rather than imported so this
 * module keeps no dependency on `provider/`, and so the classification stays testable without a
 * `window`.
 */
export function describeWalletConnectionSource(
    source: WalletConnectionSource | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[],
    isInsideWalletBrowser: (jsBridgeKey: string) => boolean
): WalletConnectionSourceInfo {
    if (Array.isArray(source)) {
        return { kind: 'http-any-wallet' };
    }

    if (isWalletConnectionSourceJS(source)) {
        return {
            kind: isInsideWalletBrowser(source.jsBridgeKey) ? 'js-embedded' : 'js-injected',
            jsBridgeKey: source.jsBridgeKey
        };
    }

    if (isWalletConnectionSourceWalletConnect(source)) {
        return { kind: 'wallet-connect' };
    }

    return { kind: 'http-specific-wallet', bridgeUrl: source.bridgeUrl };
}

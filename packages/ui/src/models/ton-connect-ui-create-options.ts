import { EventDispatcher, ITonConnect, SdkActionEvent } from '@tonconnect/sdk';
import { TonConnectUiOptions } from 'src/models/ton-connect-ui-options';
import { UserActionEvent } from 'src/tracker/types';

/**
 * Constructor options for `new TonConnectUI(...)`. Either pass a
 * `manifestUrl` and let `TonConnectUI` create the underlying connector for
 * you, or hand in an existing `ITonConnect` instance via `connector`.
 *
 * Both shapes extend {@link TonConnectUiCreateOptionsBase} (and therefore
 * {@link TonConnectUiOptions}), so the UI-level options — theme, language,
 * wallet filters, analytics — are the same regardless of which form you
 * pick.
 */
export type TonConnectUiCreateOptions =
    | TonConnectUiOptionsWithConnector
    | TonConnectUiOptionsWithManifest;

/**
 * Construct a fresh `TonConnect` connector internally from `manifestUrl`.
 * The most common form for browser dApps.
 */
export interface TonConnectUiOptionsWithManifest extends TonConnectUiCreateOptionsBase {
    /**
     * HTTPS URL of the dApp's
     * [`tonconnect-manifest.json`](https://github.com/ton-blockchain/ton-connect/blob/main/spec/manifest.md).
     * When omitted, the SDK falls back to
     * `${window.location.origin}/tonconnect-manifest.json`.
     */
    manifestUrl?: string;
}

/**
 * Reuse an externally-built `ITonConnect`. Useful when the dApp drives
 * `@tonconnect/sdk` directly and only wants the UI layer on top, or when
 * server-side rendering supplies the connector through a custom factory.
 */
export interface TonConnectUiOptionsWithConnector extends TonConnectUiCreateOptionsBase {
    /**
     * Pre-built `ITonConnect` instance. The UI does not create its own
     * connector; option fields like `manifestUrl` are ignored.
     */
    connector?: ITonConnect;
}

/** Common UI-only fields applied on top of either constructor shape. */
export interface TonConnectUiCreateOptionsBase extends TonConnectUiOptions {
    /**
     * Attempt to restore the previous session from storage on mount. Set to
     * `false` for flows that prefer an explicit connect step.
     *
     * @default true
     */
    restoreConnection?: boolean;

    /**
     * HTML element id under which the SDK attaches its modal root. When
     * omitted, the SDK creates `div#tc-widget-root` at the end of `<body>`
     * and uses it.
     *
     * @default 'tc-widget-root'
     */
    widgetRootId?: string;

    /**
     * Custom event dispatcher for both SDK- and UI-layer user-action events.
     * Defaults to `window.dispatchEvent` (`BrowserEventDispatcher`).
     */
    eventDispatcher?: EventDispatcher<UserActionEvent | SdkActionEvent>;
}

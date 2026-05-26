import { IStorage } from 'src/storage/models/storage.interface';
import { EventDispatcher } from 'src/tracker/event-dispatcher';
import { SdkActionEvent } from 'src/tracker/types';
import { RequiredFeatures } from './wallet';
import { IEnvironment } from 'src/environment/models/environment.interface';
import { AnalyticsMode } from 'src/analytics/analytics-manager';

/**
 * Analytics configuration forwarded to the SDK's internal tracker.
 *
 * Analytics is opt-out. The default mode is `'telemetry'` —
 * minimal, anonymous signals used for technical research and issue debugging.
 * Set `mode: 'off'` to disable, or `mode: 'full'` to opt into the full event
 * stream.
 */
export interface AnalyticsSettings {
    /**
     * - `'off'` — no events are collected or sent.
     * - `'telemetry'` — technical analytics only (default).
     * - `'full'` — full user-action event stream.
     *
     * @default 'telemetry'
     */
    mode?: AnalyticsMode;
}

/**
 * Constructor options for the `TonConnect` connector.
 *
 * For most browser dApps `{ manifestUrl }` is enough; the SDK fills in
 * `localStorage`, fetches the canonical wallets list, and runs analytics in
 * the default `'telemetry'` mode.
 */
export interface TonConnectOptions {
    /**
     * HTTPS URL of the dApp's `tonconnect-manifest.json`. The wallet fetches
     * this file before showing the connect prompt to extract the dApp's name,
     * icon and policy URLs. If omitted, the SDK falls back to
     * `${window.location.origin}/tonconnect-manifest.json`.
     *
     * @see [App manifest spec](https://github.com/ton-blockchain/ton-connect/blob/main/spec/manifest.md)
     */
    manifestUrl?: string;

    /**
     * Storage backend for protocol state (session keys, last connected
     * wallet). Defaults to `window.localStorage` in the browser. Required
     * when running the SDK in Node.js.
     */
    storage?: IStorage;

    /**
     * Custom event dispatcher for user-action events. Defaults to
     * `window.dispatchEvent` in the browser, emitting `CustomEvent`s prefixed
     * with `ton-connect-`.
     */
    eventDispatcher?: EventDispatcher<SdkActionEvent>;

    /**
     * Override the wallets-list JSON source. Must point to a file matching the
     * [wallets-v2 schema](https://github.com/ton-connect/wallets-list).
     *
     * @default 'https://config.ton.org/wallets-v2.json'
     */
    walletsListSource?: string;

    /**
     * In-memory cache TTL for the fetched wallets list, in milliseconds.
     * `Infinity` (default) caches forever for the lifetime of the page.
     *
     * @default Infinity
     */
    walletsListCacheTTLMs?: number;

    /**
     * Required wallet capabilities. Wallets that do not advertise every
     * requested feature are hidden from the picker (and rejected at connect
     * time if the user selects one through a custom flow).
     *
     * @see [Filter wallets by required features (docs)](https://docs.ton.org/applications/ton-connect/how-to/filter-wallets)
     */
    walletsRequiredFeatures?: RequiredFeatures;

    /**
     * Disable the automatic pause / unpause of the SSE bridge connection
     * driven by `document.visibilitychange`.
     */
    disableAutoPauseConnection?: boolean;

    /**
     * Override the runtime environment (platform, user-agent, Telegram user
     * context). The SDK auto-detects in browsers; pass an {@link IEnvironment}
     * implementation when embedding the SDK in a non-standard host.
     */
    environment?: IEnvironment;

    /**
     * Analytics configuration.
     */
    analytics?: AnalyticsSettings;
}

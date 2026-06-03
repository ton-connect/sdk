import { createContext, FunctionComponent, memo, ReactNode, useState } from 'react';
import {
    ActionConfiguration,
    Locales,
    TonConnectUI,
    UIPreferences,
    WalletsListConfiguration
} from '@tonconnect/ui';
import type { ITonConnect, RequiredFeatures, AnalyticsSettings } from '@tonconnect/ui';
import { isClientSide } from '../utils/web';

export const TonConnectUIContext = createContext<TonConnectUI | null>(null);

/**
 * Props for `<TonConnectUIProvider>`. Pick one of three shapes:
 *
 * - {@link TonConnectUIProviderPropsWithManifest} — most common: pass a
 *   `manifestUrl`, the provider builds a `TonConnectUI` for you.
 * - {@link TonConnectUIProviderPropsWithConnector} — pass a pre-built
 *   `ITonConnect` (from `@tonconnect/sdk`); the provider wraps it in UI.
 * - {@link TonConnectUIProviderPropsWithInstance} — pass an externally
 *   constructed `TonConnectUI`.
 *
 * The manifest / connector variants accept the same UI-level options as the
 * vanilla `TonConnectUiOptions` (theme, language, wallet filters,
 * analytics).
 */
export type TonConnectUIProviderProps = {
    children: ReactNode;
} & (
    | Partial<
          TonConnectUIProviderPropsBase &
              (TonConnectUIProviderPropsWithManifest | TonConnectUIProviderPropsWithConnector)
      >
    | TonConnectUIProviderPropsWithInstance
);

/**
 * Pass a `manifestUrl` and let the provider build a `TonConnectUI` from
 * the merged UI options.
 */
export interface TonConnectUIProviderPropsWithManifest {
    /**
     * HTTPS URL of the dApp's
     * [`tonconnect-manifest.json`](https://github.com/ton-blockchain/ton-connect/blob/main/spec/manifest.md).
     * When omitted, the SDK falls back to
     * `${window.location.origin}/tonconnect-manifest.json`.
     */
    manifestUrl: string;
}

/**
 * Pass a pre-built `ITonConnect` (typically from `@tonconnect/sdk`) — the
 * provider wraps it in a `TonConnectUI`. Useful when the dApp drives the
 * underlying SDK directly and only wants the React UI on top.
 */
export interface TonConnectUIProviderPropsWithConnector {
    /** Existing `ITonConnect` instance. The provider will not create its own. */
    connector: ITonConnect;
}

/**
 * Pass an externally-constructed `TonConnectUI`.
 *
 * Note: `TonConnectUI` is a singleton inside this package. The instance you
 * pass is stored in the global singleton and reused by all hooks.
 */
export interface TonConnectUIProviderPropsWithInstance {
    instance: TonConnectUI;
}

/**
 * Common UI options accepted in addition to the constructor selector
 * (`manifestUrl` / `connector`). All optional; mirror the fields on
 * `TonConnectUiOptions` from `@tonconnect/ui`.
 */
export interface TonConnectUIProviderPropsBase {
    /**
     * Attempt to restore the previous session from storage on mount. Set to
     * `false` for flows that prefer an explicit connect step.
     *
     * @default true
     */
    restoreConnection: boolean;

    /**
     * Language for SDK-rendered strings.
     *
     * @default system locale
     */
    language: Locales;

    /**
     * HTML element id under which the modal root is attached. Defaults to
     * `tc-widget-root` (created at the end of `<body>`).
     */
    widgetRootId: string;

    /** Visual configuration — theme, border radius, color overrides. */
    uiPreferences?: UIPreferences;

    /** Wallets-list overrides — include extra wallets, reorder existing ones. */
    walletsListConfiguration?: WalletsListConfiguration;

    /**
     * Hide wallets from the picker that don't advertise the listed
     * features. Non-matching entries are greyed out below the separator and
     * rejected at connect time with `WalletMissingRequiredFeaturesError`.
     */
    walletsRequiredFeatures?: RequiredFeatures;

    /**
     * Soft preference filter — non-matching wallets remain clickable but
     * sorted below the separator. The SDK does NOT enforce the match at
     * connect time.
     */
    walletsPreferredFeatures?: RequiredFeatures;

    /**
     * Modal / notification behaviour and the return strategy for action
     * deep links. See `ActionConfiguration`.
     */
    actionsConfiguration?: ActionConfiguration;

    /**
     * Close modals and notifications when the Android back button is
     * pressed. Disable when the dApp manages browser history manually.
     *
     * @default true
     */
    enableAndroidBackHandler?: boolean;

    /**
     * Analytics configuration forwarded to the underlying `TonConnect`
     * instance. See `AnalyticsSettings` from `@tonconnect/sdk`.
     */
    analytics?: AnalyticsSettings;
}

let tonConnectUI: TonConnectUI | null = null;

/**
 * Root provider for `@tonconnect/ui-react`. Place it once near the top of
 * the React tree. All `useTonConnectUI` / `useTonAddress` / `useTonWallet`
 * etc. hooks and `<TonConnectButton />` must be rendered inside.
 *
 * Internally constructs a singleton `TonConnectUI` instance;
 * mounting a second `<TonConnectUIProvider>` with different props has no
 * effect once the instance is built.
 *
 * @example
 * ```tsx
 * import { TonConnectUIProvider } from '@tonconnect/ui-react';
 *
 * export default function App() {
 *     return (
 *         <TonConnectUIProvider manifestUrl="https://example.com/tonconnect-manifest.json">
 *             <Router />
 *         </TonConnectUIProvider>
 *     );
 * }
 * ```
 */
const TonConnectUIProvider: FunctionComponent<TonConnectUIProviderProps> = ({
    children,
    ...options
}) => {
    const [uiInstance] = useState<TonConnectUI | null>(() => {
        if (!isClientSide()) {
            return null;
        }

        if (tonConnectUI !== null) {
            return tonConnectUI;
        }

        if ('instance' in options) {
            tonConnectUI = options.instance;
        } else {
            tonConnectUI = new TonConnectUI(options);
        }

        return tonConnectUI;
    });

    return (
        <TonConnectUIContext.Provider value={uiInstance}>{children}</TonConnectUIContext.Provider>
    );
};

export default memo(TonConnectUIProvider);

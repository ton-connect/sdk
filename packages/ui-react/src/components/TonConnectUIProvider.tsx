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

/**
 * @internal
 */
export const TonConnectUIContext = createContext<TonConnectUI | null>(null);

export type TonConnectUIProviderProps = {
    children: ReactNode;
} & (
    | Partial<
          TonConnectUIProviderPropsBase &
              (TonConnectUIProviderPropsWithManifest | TonConnectUIProviderPropsWithConnector)
      >
    | TonConnectUIProviderPropsWithInstance
);

export interface TonConnectUIProviderPropsWithManifest {
    /**
     * URL to the [manifest]{@link https://github.com/ton-connect/docs/blob/main/requests-responses.md#app-manifest} with the dApp metadata that is displayed in the user's wallet.
     * If not passed, the manifest is loaded from `${window.location.origin}/tonconnect-manifest.json`.
     */
    manifestUrl: string;
}

export interface TonConnectUIProviderPropsWithConnector {
    /**
     * TonConnect instance. Can be helpful if you use custom ITonConnect implementation, or use both of @tonconnect/sdk and @tonconnect/ui in your app.
     */
    connector: ITonConnect;
}

export interface TonConnectUIProviderPropsWithInstance {
    /**
     * TonConnectUI instance. Can be helpful if TonConnectUI instance is used outside of React context.
     *
     * Note: TonConnect UI works as a singleton.
     * A custom instance is stored in the global singleton on first render
     * and reused by the library on subsequent renders.
     */
    instance: TonConnectUI;
}

export interface TonConnectUIProviderPropsBase {
    /**
     * Try to restore existing session and reconnect to the corresponding wallet.
     * @default true
     */
    restoreConnection: boolean;

    /**
     * Language for the phrases it the UI elements.
     * @default system
     */
    language: Locales;

    /**
     * HTML element id to attach the modal window element. If not passed, the library appends `div#tc-widget-root` to the end of `<body>` and uses it.
     * @default `div#tc-widget-root`
     */
    widgetRootId: string;

    /**
     * UI elements configuration.
     */
    uiPreferences?: UIPreferences;

    /**
     * Configuration for the wallets list in the connect wallet modal.
     */
    walletsListConfiguration?: WalletsListConfiguration;

    /**
     * Required features for wallets to be displayed in the connect wallet modal.
     */
    walletsRequiredFeatures?: RequiredFeatures;

    /**
     * Preferred features for wallets to be displayed in the connect wallet modal.
     */
    walletsPreferredFeatures?: RequiredFeatures;

    /**
     * Configuration for action-period (e.g. sendTransaction) UI elements: modals and notifications and wallet behaviour (return strategy).
     */
    actionsConfiguration?: ActionConfiguration;

    /**
     * Specifies whether the Android back button should be used to close modals and notifications on Android devices.
     * @default true
     */
    enableAndroidBackHandler?: boolean;

    /**
     * Analytics configuration forwarded to the underlying TonConnect SDK instance.
     */
    analytics?: AnalyticsSettings;
}

let tonConnectUI: TonConnectUI | null = null;

const TonConnectUIProviderComponent: FunctionComponent<TonConnectUIProviderProps> = ({
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

/**
 * Add TonConnectUIProvider to the root of the app. You can specify UI options using props.
 * All TonConnect UI hooks calls and `<TonConnectButton />` component must be placed inside `<TonConnectUIProvider>`.
 * @param children JSX to insert.
 * @param options additional options.
 * @constructor
 */
const TonConnectUIProvider = memo(TonConnectUIProviderComponent);

export default TonConnectUIProvider;

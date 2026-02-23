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

export type TonConnectUIProviderProps = {
    children: ReactNode;
} & (
    | Partial<
          TonConnectUIProviderPropsBase &
              (
                  | TonConnectUIProviderPropsWithManifest
                  | TonConnectUIProviderPropsWithConnector
                  | TonConnectUIProviderPropsWithManifestObject
              )
      >
    | TonConnectUIProviderPropsWithInstance
);

export interface TonConnectUIProviderPropsWithManifest {
    /**
     * Url to the [manifest]{@link https://github.com/ton-connect/docs/blob/main/requests-responses.md#app-manifest} with the Dapp metadata that will be displayed in the user's wallet.
     * If not passed, manifest from `${window.location.origin}/tonconnect-manifest.json` will be taken.
     */
    manifestUrl: string;
}

export interface TonConnectUIProviderPropsWithManifestObject {
    manifest: {
        url: string; // required
        name: string; // required
        iconUrl: string; // required
        termsOfUseUrl?: string; // optional
        privacyPolicyUrl?: string; // optional
    };
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
     * If you pass a custom instance, it will be stored in the global singleton
     * and reused by the library.
     */
    instance: TonConnectUI;
}

export interface TonConnectUIProviderPropsBase {
    /**
     * Try to restore existing session and reconnect to the corresponding wallet.
     * @default true.
     */
    restoreConnection: boolean;

    /**
     * Language for the phrases it the UI elements.
     * @default system
     */
    language: Locales;

    /**
     * HTML element id to attach the modal window element. If not passed, `div#tc-widget-root` in the end of the <body> will be added and used.
     * @default `div#tc-widget-root`.
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

/**
 * Add TonConnectUIProvider to the root of the app. You can specify UI options using props.
 * All TonConnect UI hooks calls and `<TonConnectButton />` component must be placed inside `<TonConnectUIProvider>`.
 * @param children JSX to insert.
 * @param [options] additional options.
 * @constructor
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

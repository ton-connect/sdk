import { createContext, FunctionComponent, memo, ReactNode } from 'react';
import {
    ActionConfiguration,
    Locales,
    TonConnectUI,
    UIPreferences,
    WalletsListConfiguration
} from '@tonconnect/ui';
import type { ITonConnect, Feature, RequireFeature } from '@tonconnect/ui';
import { isClientSide } from '../utils/web';

export const TonConnectUIContext = createContext<TonConnectUI | null>(null);

export type TonConnectUIProviderProps = {
    children: ReactNode;
} & Partial<TonConnectUIProviderPropsBase> &
    Partial<TonConnectUIProviderPropsWithManifest | TonConnectUIProviderPropsWithConnector>;

export interface TonConnectUIProviderPropsWithManifest {
    /**
     * Url to the [manifest]{@link https://github.com/ton-connect/docs/blob/main/requests-responses.md#app-manifest} with the Dapp metadata that will be displayed in the user's wallet.
     * If not passed, manifest from `${window.location.origin}/tonconnect-manifest.json` will be taken.
     */
    manifestUrl: string;
}

export interface TonConnectUIProviderPropsWithConnector {
    /**
     * TonConnect instance. Can be helpful if you use custom ITonConnect implementation, or use both of @tonconnect/sdk and @tonconnect/ui in your app.
     */
    connector: ITonConnect;
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
    walletsRequiredFeatures?: RequireFeature[] | ((features: Feature[]) => boolean);

    /**
     * Configuration for action-period (e.g. sendTransaction) UI elements: modals and notifications and wallet behaviour (return strategy).
     */
    actionsConfiguration?: ActionConfiguration;

    /**
     * Specifies whether the Android back button should be used to close modals and notifications on Android devices.
     * @default true
     */
    enableAndroidBackHandler?: boolean;
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
    if (isClientSide() && !tonConnectUI) {
        tonConnectUI = new TonConnectUI(options);
    }

    return (
        <TonConnectUIContext.Provider value={tonConnectUI}>{children}</TonConnectUIContext.Provider>
    );
};

export default memo(TonConnectUIProvider);

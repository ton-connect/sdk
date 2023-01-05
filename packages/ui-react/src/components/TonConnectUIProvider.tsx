import { createContext, FunctionComponent, memo } from 'react';
import { Locales, Theme, TonConnectUI } from '@tonconnect/ui';
import { ITonConnect } from '@tonconnect/sdk';
import type * as CSS from 'csstype';
type Color = CSS.Property.Color;

export const TonConnectUIContext = createContext<TonConnectUI | null>(null);

export type TonConnectUIProviderProps = {
    children: JSX.Element;
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
     * Color theme for the UI elements.
     * @default SYSTEM theme.
     */
    theme: Theme;

    /**
     * Accent color for the UI elements.
     * @default #31A6F5 (blue).
     */
    accentColor: Color;

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
     * @deprecated Don't use it
     */
    walletsListSource: string;
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
    if (!tonConnectUI) {
        tonConnectUI = new TonConnectUI(options);
    }

    return (
        <TonConnectUIContext.Provider value={tonConnectUI}>{children}</TonConnectUIContext.Provider>
    );
};

export default memo(TonConnectUIProvider);

import { createContext, FunctionComponent, memo } from 'react';
import { Locales, Theme, TonConnectUi } from '@tonconnect/ui';
import { ITonConnect } from '@tonconnect/sdk';
import { Property } from 'csstype';
import Color = Property.Color;

export const TonConnectUIContext = createContext<TonConnectUi | null>(null);

export type TonConnectUIProviderProps = {
    children: JSX.Element;
} & Partial<TonConnectUIProviderPropsBase> &
    (TonConnectUIProviderPropsWithManifest | TonConnectUIProviderPropsWithConnector);

export interface TonConnectUIProviderPropsWithManifest {
    manifestUrl: string;
}

export interface TonConnectUIProviderPropsWithConnector {
    connector: ITonConnect;
}

export interface TonConnectUIProviderPropsBase {
    restoreConnection: boolean;
    theme: Theme;
    accentColor: Color;
    language: Locales;
}

const TonConnectUIProvider: FunctionComponent<TonConnectUIProviderProps> = ({
    children,
    ...options
}) => {
    const tonConnectUI = new TonConnectUi(options);

    return (
        <TonConnectUIContext.Provider value={tonConnectUI}>{children}</TonConnectUIContext.Provider>
    );
};

export default memo(TonConnectUIProvider);

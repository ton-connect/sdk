import { TonConnectUIProvider } from '@tonconnect/ui-react';

import { AppRouter, ThemeProvider } from '@/core/components';
import { tonConnectManifestUrl, tonConnectUiPreferences } from '@/core/configs/app-kit';

export const App = () => {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="demo-dapp-theme">
            <TonConnectUIProvider
                manifestUrl={tonConnectManifestUrl}
                uiPreferences={tonConnectUiPreferences}
            >
                <AppRouter />
            </TonConnectUIProvider>
        </ThemeProvider>
    );
};

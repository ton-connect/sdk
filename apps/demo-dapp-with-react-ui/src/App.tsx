import { TonConnectUIProvider } from '@tonconnect/ui-react';

import { AppRouter, ThemeProvider } from '@/core/components';
import { tonConnectManifestUrl, tonConnectUiPreferences } from '@/core/configs/app-kit';
import { getProviderAnalyticsSettingsFromLocation } from '@/features/dev-settings/lib/settings-url';

export const App = () => {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="demo-dapp-theme">
            <TonConnectUIProvider
                manifestUrl={tonConnectManifestUrl}
                uiPreferences={tonConnectUiPreferences}
                analytics={getProviderAnalyticsSettingsFromLocation()}
            >
                <AppRouter />
            </TonConnectUIProvider>
        </ThemeProvider>
    );
};

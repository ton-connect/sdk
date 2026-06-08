import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppRouter, ThemeProvider } from './core/components/index';
import { tonConnectManifestUrl, tonConnectUiPreferences } from './core/configs/app-kit';
import { getProviderAnalyticsSettingsFromLocation } from './features/dev-settings/utils/settings-url';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000,
            retry: 2,
            retryDelay: attemptIndex => Math.min(10_000, 2_000 * 2 ** attemptIndex),
            refetchOnWindowFocus: false
        }
    }
});

export const App = () => {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="demo-dapp-theme">
            <QueryClientProvider client={queryClient}>
                <TonConnectUIProvider
                    manifestUrl={tonConnectManifestUrl}
                    uiPreferences={tonConnectUiPreferences}
                    analytics={getProviderAnalyticsSettingsFromLocation()}
                >
                    <AppRouter />
                </TonConnectUIProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
};

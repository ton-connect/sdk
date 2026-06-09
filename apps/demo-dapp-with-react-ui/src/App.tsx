import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';

import { AppRouter, ThemeProvider } from './core/components/index';
import { tonConnectManifestUrl, tonConnectUiPreferences } from './core/configs/app-kit';
import { createPreviewConnector } from './features/widget-builder/utils/preview-mocks';
import {
    getProviderAnalyticsSettingsFromLocation,
    parseSettingsFromSearchParams,
    toTonConnectOptions
} from './features/dev-settings/utils/settings-url';

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
    const isWidgetPreview =
        typeof window !== 'undefined' && window.location.pathname.endsWith('/widget-preview');
    const widgetPreviewOptions =
        typeof window !== 'undefined' && isWidgetPreview
            ? toTonConnectOptions(
                  parseSettingsFromSearchParams(new URLSearchParams(window.location.search))
              )
            : undefined;
    const previewConnector = useMemo(
        () => (isWidgetPreview ? createPreviewConnector(tonConnectManifestUrl) : null),
        [isWidgetPreview]
    );

    const tonConnectProviderProps = isWidgetPreview
        ? {
              connector: previewConnector!,
              restoreConnection: false as const,
              uiPreferences: widgetPreviewOptions?.uiPreferences ?? tonConnectUiPreferences,
              language: widgetPreviewOptions?.language,
              actionsConfiguration: {
                  ...widgetPreviewOptions?.actionsConfiguration,
                  returnStrategy: 'none' as const,
                  skipRedirectToWallet: 'always' as const
              },
              walletsRequiredFeatures: widgetPreviewOptions?.walletsRequiredFeatures,
              walletsPreferredFeatures: widgetPreviewOptions?.walletsPreferredFeatures,
              enableAndroidBackHandler: widgetPreviewOptions?.enableAndroidBackHandler,
              analytics: getProviderAnalyticsSettingsFromLocation()
          }
        : {
              manifestUrl: tonConnectManifestUrl,
              uiPreferences: tonConnectUiPreferences,
              analytics: getProviderAnalyticsSettingsFromLocation()
          };

    return (
        <ThemeProvider defaultTheme="dark" storageKey="demo-dapp-theme">
            <QueryClientProvider client={queryClient}>
                <TonConnectUIProvider {...tonConnectProviderProps}>
                    <AppRouter />
                </TonConnectUIProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
};

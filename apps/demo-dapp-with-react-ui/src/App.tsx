import { TonConnectUIProvider } from '@tonconnect/ui-react';

import { AppRouter } from '@/core/components';
import { tonConnectManifestUrl, tonConnectUiPreferences } from '@/core/configs/app-kit';

export const App = () => {
    return (
        <TonConnectUIProvider
            manifestUrl={tonConnectManifestUrl}
            uiPreferences={tonConnectUiPreferences}
        >
            <AppRouter />
        </TonConnectUIProvider>
    );
};

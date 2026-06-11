import { THEME, initializeWalletConnect } from '@tonconnect/ui-react';
import { UniversalConnector } from '@reown/appkit-universal-connector';

initializeWalletConnect(UniversalConnector, {
    projectId: '9cb446f4a1b697039a23332618d942b0',
    metadata: {
        name: 'Demo DApp',
        icons: [
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0uc4aSvQASroq4VfMx30RkZzIX8wiefg3rQ&s'
        ],
        url: window.location.origin,
        description: 'Demo DApp'
    }
});

// TODO: temporary for the injected-restore repro stand — use the manifest of the
// current deployment (vercel preview) instead of the prod one, otherwise wallets
// block the connection as phishing (manifest url mismatch). Revert before merge.
export const tonConnectManifestUrl = `${window.location.origin}/tonconnect-manifest.json`;

export const tonConnectUiPreferences = { theme: THEME.DARK } as const;

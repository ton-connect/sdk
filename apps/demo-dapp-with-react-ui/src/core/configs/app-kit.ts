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

export const tonConnectManifestUrl =
    'https://tonconnect-sdk-demo-dapp.vercel.app/tonconnect-manifest.json';

export const tonConnectUiPreferences = { theme: THEME.DARK } as const;

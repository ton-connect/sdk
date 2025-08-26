import { TonConnectUIProvider } from '@tonconnect/ui-react';
import type { ReactNode } from 'react';

const manifestUrl =
    'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json';

interface TonConnectProviderProps {
    children: ReactNode;
}

export function TonConnectProvider({ children }: TonConnectProviderProps) {
    return <TonConnectUIProvider manifestUrl={manifestUrl}>{children}</TonConnectUIProvider>;
}

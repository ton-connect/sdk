import { TonConnectUIProvider } from '@tonconnect/ui-react';
import type { ReactNode } from 'react';

export const manifestUrl = 'https://allure-test-stand.vercel.app/tonconnect-manifest.json';

interface TonConnectProviderProps {
    children: ReactNode;
}

export function TonConnectProvider({ children }: TonConnectProviderProps) {
    return <TonConnectUIProvider manifestUrl={manifestUrl}>{children}</TonConnectUIProvider>;
}

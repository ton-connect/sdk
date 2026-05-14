import { useEffect, useState } from 'react';
import { useTonConnectUI } from './useTonConnectUI';

/**
 * Indicates current status of the connection restoring process.
 * @throws {TonConnectProviderNotSetError} when called on the client side without a `<TonConnectUIProvider>` ancestor.
 */
export function useIsConnectionRestored(): boolean {
    const [restored, setRestored] = useState(false);
    const [tonConnectUI] = useTonConnectUI();

    useEffect(() => {
        if (tonConnectUI) {
            tonConnectUI.connectionRestored.then(() => setRestored(true));
        }
    }, [tonConnectUI]);

    return restored;
}

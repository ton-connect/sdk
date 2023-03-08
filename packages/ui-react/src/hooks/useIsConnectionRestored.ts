import { useEffect, useState } from 'react';
import { useTonConnectUI } from './useTonConnectUI';

/**
 * Indicates current status of the connection restoring process.
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

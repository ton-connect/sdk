import { useState } from 'react';
import { useTonConnectUI } from './useTonConnectUI';

/**
 * Indicates current status of the connection restoring process.
 */
export function useIsConnectionRestored(): boolean {
    const [restored, setRestored] = useState(false);
    const [tonConnectUI] = useTonConnectUI();

    tonConnectUI.connectionRestored.then(() => setRestored(true));

    return restored;
}

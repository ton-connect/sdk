import { useState } from 'react';
import { useTonConnectUI } from './useTonConnectUI';
import { isServerSide } from '../utils/web';

/**
 * Indicates current status of the connection restoring process.
 */
export function useIsConnectionRestored(): boolean {
    if (isServerSide()) {
        return false;
    }

    const [restored, setRestored] = useState(false);
    const [tonConnectUI] = useTonConnectUI();

    tonConnectUI.connectionRestored.then(() => setRestored(true));

    return restored;
}

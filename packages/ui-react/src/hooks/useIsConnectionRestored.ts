import { useEffect, useState } from 'react';
import { useTonConnectUI } from './useTonConnectUI';

/**
 * Indicates current status of the connection restoring process.
 *
 * Returns `false` on first render and flips to `true` once
 * `tonConnectUI.connectionRestored` resolves. Use it to gate UI that
 * depends on knowing the final connection state — e.g. avoid rendering
 * a "Connect wallet" CTA before a session restore has had a chance to
 * complete.
 *
 * @throws {TonConnectProviderNotSetError} when called on the client side without a `<TonConnectUIProvider>` ancestor.
 * @example
 * function App() {
 *     const restored = useIsConnectionRestored();
 *     const wallet = useTonWallet();
 *
 *     if (!restored) {
 *         return <p>Restoring session...</p>;
 *     }
 *
 *     return wallet ? <Dashboard /> : <ConnectScreen />;
 * }
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

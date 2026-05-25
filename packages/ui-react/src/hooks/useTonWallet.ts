import { useEffect, useState } from 'react';
import { ConnectedWallet, Wallet, WalletInfoWithOpenMethod } from '@tonconnect/ui';
import { useTonConnectUI } from './useTonConnectUI';

/**
 * Use it to get the user's current TON wallet. Returns `null` when no wallet is connected.
 *
 * Subscribes to `tonConnectUI.onStatusChange` internally, so the component
 * re-renders whenever the user connects, disconnects, or switches accounts.
 *
 * @throws {@link TonConnectProviderNotSetError} when called on the client side without a `<TonConnectUIProvider>` ancestor.
 * @example
 * function WalletStatus() {
 *     const wallet = useTonWallet();
 *
 *     if (!wallet) {
 *         return <p>No wallet connected</p>;
 *     }
 *
 *     return <p>Connected: {wallet.account.address}</p>;
 * }
 */
export function useTonWallet(): Wallet | (Wallet & WalletInfoWithOpenMethod) | null {
    const [tonConnectUI] = useTonConnectUI();
    const [wallet, setWallet] = useState<Wallet | (Wallet & WalletInfoWithOpenMethod) | null>(
        tonConnectUI?.wallet || null
    );

    useEffect(() => {
        if (tonConnectUI) {
            setWallet(tonConnectUI.wallet);
            return tonConnectUI.onStatusChange((value: ConnectedWallet | null) => {
                setWallet(value);
            });
        }
    }, [tonConnectUI]);

    return wallet;
}

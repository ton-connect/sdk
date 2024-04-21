import { useEffect, useState } from 'react';
import { ConnectedWallet, Wallet, WalletInfoWithOpenMethod } from '@tonconnect/ui';
import { useTonConnectUI } from './useTonConnectUI';

/**
 * Use it to get user's current ton wallet. If wallet is not connected hook will return null.
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

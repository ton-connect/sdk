import { useTonConnectUI } from './useTonConnectUI';
import { useEffect, useState } from 'react';
import { WalletInfoWithOpenMethod, Wallet } from '@tonconnect/ui';

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
            return tonConnectUI.onStatusChange(value => {
                setWallet(value);
            });
        }
    }, [tonConnectUI]);

    return wallet;
}

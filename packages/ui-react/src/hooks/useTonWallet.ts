import { useTonConnectUI } from './useTonConnectUI';
import { Wallet, WalletInfo } from '@tonconnect/sdk';
import { useState } from 'react';

export function useTonWallet(): (Wallet & WalletInfo) | null {
    const [tonConnectUI] = useTonConnectUI();
    const [wallet, setWallet] = useState<(Wallet & WalletInfo) | null>(null);

    tonConnectUI.onStatusChange(value => {
        setWallet(value);
    });

    return wallet;
}

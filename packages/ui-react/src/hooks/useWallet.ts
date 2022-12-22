import { useTonConnectUI } from './useTonConnectUI';
import { Wallet, WalletInfo } from '@tonconnect/sdk';
import { useState } from 'react';

export function useWallet(): (Wallet & WalletInfo) | null {
    const [tonConnectUI] = useTonConnectUI();
    const [wallet, setWallet] = useState<(Wallet & WalletInfo) | null>(null);

    tonConnectUI.onStatusChange(value => {
        if (!value) {
            setWallet(value);
        } else {
            setWallet({ ...value, ...tonConnectUI.walletInfo! });
        }
    });

    return wallet;
}

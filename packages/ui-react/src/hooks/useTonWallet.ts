import { useTonConnectUI } from './useTonConnectUI';
import { Wallet, WalletInfo } from '@tonconnect/sdk';
import { useEffect, useState } from 'react';

export function useTonWallet(): (Wallet & WalletInfo) | null {
    const [tonConnectUI] = useTonConnectUI();
    const [wallet, setWallet] = useState<(Wallet & WalletInfo) | null>(
        () => tonConnectUI.wallet && { ...tonConnectUI.wallet, ...tonConnectUI.walletInfo! }
    );

    useEffect(
        () =>
            tonConnectUI.onStatusChange(value => {
                setWallet(value);
            }),
        [tonConnectUI]
    );

    return wallet;
}

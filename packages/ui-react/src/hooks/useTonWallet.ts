import { useTonConnectUI } from './useTonConnectUI';
import { Wallet } from '@tonconnect/sdk';
import { useEffect, useState } from 'react';
import { isServerSide } from '../utils/web';
import { WalletInfoWithOpenMethod } from '@tonconnect/ui';

/**
 * Use it to get user's current ton wallet. If wallet is not connected hook will return null.
 */
export function useTonWallet(): (Wallet & WalletInfoWithOpenMethod) | null {
    if (isServerSide()) {
        return null;
    }

    const [tonConnectUI] = useTonConnectUI();
    const [wallet, setWallet] = useState<(Wallet & WalletInfoWithOpenMethod) | null>(
        tonConnectUI.wallet
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

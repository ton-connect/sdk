import { useEffect, useState } from 'react';
import { ConnectedWallet, Wallet, WalletInfoWithOpenMethod } from '@tonconnect/ui';
import { useTonConnectUI } from './useTonConnectUI';

/**
 * Reactive accessor for the currently connected wallet. Returns `null`
 * while disconnected and refreshes on every `onStatusChange` event.
 *
 * The shape mirrors `tonConnectUI.wallet` — `Wallet` (from `@tonconnect/sdk`)
 * merged with the picker entry for the wallet (icon, name, open method).
 *
 * Must be called inside a `<TonConnectUIProvider>`.
 *
 * @example
 * ```tsx
 * const wallet = useTonWallet();
 *
 * if (!wallet) return <ConnectButton />;
 * return <span>{wallet.device.appName} · {wallet.account.address}</span>;
 * ```
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

import { WalletConnectionSource } from 'src/ton-connect/core/models/wallet-connection-source';

export function getWalletConnectionSource(walletName: string): WalletConnectionSource {
    return { bridgeLink: walletName } as WalletConnectionSource;
}

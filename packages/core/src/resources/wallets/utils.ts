import { WalletConnectionSource } from 'src/models';

export function getWalletConnectionSource(walletName: string): WalletConnectionSource {
    return { bridgeLink: walletName } as WalletConnectionSource;
}

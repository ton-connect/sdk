import { WalletConnectionSource } from '@tonconnect/sdk';

export interface UiWallet {
    name: string;
    iconUrl: string;
    connectionSource: WalletConnectionSource;
}

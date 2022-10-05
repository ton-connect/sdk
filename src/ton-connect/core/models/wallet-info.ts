import { Account } from 'src/ton-connect/core/models/account';

export interface WalletInfo {
    walletName: string;
    provider: 'http' | 'injected';
    account: Account;
}

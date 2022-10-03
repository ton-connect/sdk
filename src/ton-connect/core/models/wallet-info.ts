import { Account } from 'src/ton-connect/core/models/account';
import { CHAIN } from 'src/ton-connect/core/models/CHAIN';

export interface WalletInfo {
    walletName: string;
    account: Account;
    chain: CHAIN;
}

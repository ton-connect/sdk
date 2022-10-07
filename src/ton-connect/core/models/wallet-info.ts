import { Account } from 'src/ton-connect/core/models/account';
import { WalletAppInfo } from 'src/ton-connect/core/models/wallet/wallet-app-info';

export interface WalletInfo {
    appInfo: WalletAppInfo;
    provider: 'http' | 'injected';
    account: Account;
}

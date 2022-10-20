import { Account, WalletAppInfo } from 'src/models';

export interface WalletInfo {
    appInfo: WalletAppInfo;
    provider: 'http' | 'injected';
    account: Account;
}

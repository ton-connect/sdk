import { Account, DeviceInfo } from 'src/models';

export interface WalletInfo {
    appInfo: DeviceInfo;
    provider: 'http' | 'injected';
    account: Account;
}

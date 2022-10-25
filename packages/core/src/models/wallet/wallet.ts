import { Account, DeviceInfo } from 'src/models';

export interface Wallet {
    device: DeviceInfo;
    provider: 'http' | 'injected';
    account: Account;
}

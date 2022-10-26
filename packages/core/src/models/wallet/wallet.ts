import { DeviceInfo } from '@ton-connect/protocol';
import { Account } from 'src/models';

export interface Wallet {
    device: DeviceInfo;
    provider: 'http' | 'injected';

    account: Account;
}

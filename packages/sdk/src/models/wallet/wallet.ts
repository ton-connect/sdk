import { DeviceInfo, TonProofItemReply } from '@tonconnect/protocol';
import { Account } from 'src/models';

export interface Wallet {
    device: DeviceInfo;
    provider: 'http' | 'injected';
    account: Account;
    connectItems?: {
        tonProof?: TonProofItemReply;
    };
}

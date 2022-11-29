import { DeviceInfo, TonProofItemReply } from '@tonconnect/protocol';
import { Account } from 'src/models';

export interface Wallet {
    /**
     * Information about user's wallet's device.
     */
    device: DeviceInfo;

    /**
     * Provider type: http bridge or injected js.
     */
    provider: 'http' | 'injected';

    /**
     * Selected account.
     */
    account: Account;

    /**
     * Response for connect items request.
     */
    connectItems?: {
        tonProof?: TonProofItemReply;
    };
}

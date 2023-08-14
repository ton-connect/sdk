import { WalletInfo } from '@tonconnect/sdk';

export type PersonalizedWalletInfo = WalletInfo & {
    isPreferred?: boolean;
};

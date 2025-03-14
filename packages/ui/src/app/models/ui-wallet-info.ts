import { WalletInfo } from '@tonconnect/sdk';

export type UIWalletInfo = WalletInfo & {
    isPreferred?: boolean;
    isSupportRequiredFeatures: boolean;
};

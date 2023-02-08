import { WalletInfoBase, WalletInfoInjectable, WalletInfoRemote } from '@tonconnect/sdk';

export type UIWallet = WalletInfoBase &
    (Omit<WalletInfoInjectable, 'injected' | 'embedded'> | WalletInfoRemote);

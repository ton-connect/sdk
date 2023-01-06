import { WalletInfoBase, WalletInfoInjected, WalletInfoRemote } from '@tonconnect/sdk';

export type UIWallet = WalletInfoBase &
    (Omit<WalletInfoInjected, 'injected' | 'embedded'> | WalletInfoRemote);

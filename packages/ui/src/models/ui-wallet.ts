import { WalletInfoInjectable, WalletInfoRemote } from '@tonconnect/sdk';

export type UIWallet = Omit<WalletInfoInjectable, 'injected' | 'embedded'> | WalletInfoRemote;

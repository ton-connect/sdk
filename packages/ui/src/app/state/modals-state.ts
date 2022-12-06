import { WalletInfo } from '@tonconnect/sdk';
import { createSignal } from 'solid-js';

export type ActionModalName = 'confirm-transaction' | 'transaction-sent' | 'transaction-canceled';

export const [walletsModalOpen, setWalletsModalOpen] = createSignal(false);
export const [lastSelectedWalletInfo, setLastSelectedWalletInfo] = createSignal<WalletInfo | null>(
    null
);
export const [actionModalOpen, setActionModalOpen] = createSignal<ActionModalName | null>(null);

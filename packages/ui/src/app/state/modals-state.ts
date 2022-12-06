import { createSignal } from 'solid-js';

export type ActionModalName = 'confirm-transaction' | 'transaction-sent' | 'transaction-canceled';

export const [walletsModalOpen, setWalletsModalOpen] = createSignal(false);
export const [actionModalOpen, setActionModalOpen] = createSignal<ActionModalName | null>(null);

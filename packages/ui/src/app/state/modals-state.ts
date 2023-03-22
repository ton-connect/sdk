import { createSignal } from 'solid-js';
import { WalletInfoWithOpenMethod, WalletOpenMethod } from 'src/models/connected-wallet';

export type ActionName = 'confirm-transaction' | 'transaction-sent' | 'transaction-canceled';

export type Action = {
    name: ActionName;
    openModal: boolean;
    showNotification: boolean;
};

export const [walletsModalOpen, setWalletsModalOpen] = createSignal(false);
export const [lastSelectedWalletInfo, setLastSelectedWalletInfo] = createSignal<
    | WalletInfoWithOpenMethod
    | {
          openMethod: WalletOpenMethod;
      }
    | null
>(null);
export const [action, setAction] = createSignal<Action | null>(null);

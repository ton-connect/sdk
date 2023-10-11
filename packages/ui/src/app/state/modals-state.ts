import { createMemo, createSignal } from 'solid-js';
import { WalletInfoWithOpenMethod, WalletOpenMethod } from 'src/models/connected-wallet';
import { LastSelectedWalletInfoStorage } from 'src/storage';
import { ReturnStrategy } from 'src/models';

export type ActionName = 'confirm-transaction' | 'transaction-sent' | 'transaction-canceled';

export type Action = BasicAction | ConfirmTransactionAction;

type BasicAction = {
    name: ActionName;
    openModal: boolean;
    showNotification: boolean;
};

export type ConfirmTransactionAction = BasicAction & {
    name: 'confirm-transaction';
    returnStrategy: ReturnStrategy;
    twaReturnUrl: `${string}://${string}`;
};

export type WalletModalOpened = {
    state: 'opened';
    onClose: WalletsModalCloseFn;
};

export type WalletModalClosed = {
    state: 'closed';
};

export type WalletsModalState = WalletModalOpened | WalletModalClosed;

export type WalletsModalCloseReason = 'cancel' | 'select-wallet' | 'close';

export type WalletsModalCloseFn = (reason: WalletsModalCloseReason) => void;

export const [walletsModalState, setWalletsModalState] = createSignal<WalletsModalState>({
    state: 'closed'
});

export const getWalletsModalIsOpened = createMemo(() => walletsModalState().state === 'opened');

export const getWalletsModalOnClose = createMemo(() => {
    const state = walletsModalState();
    return state.state === 'opened' ? state.onClose : () => {};
});

export const openWalletsModal = (onClose: WalletsModalCloseFn): void => {
    setWalletsModalState({
        state: 'opened',
        onClose
    });
};

export const closeWalletsModal = (reason: WalletsModalCloseReason): void => {
    const onClose = getWalletsModalOnClose();
    onClose(reason);

    setWalletsModalState({
        state: 'closed'
    });
};

let lastSelectedWalletInfoStorage =
    typeof window !== 'undefined' ? new LastSelectedWalletInfoStorage() : undefined;
export const [lastSelectedWalletInfo, _setLastSelectedWalletInfo] = createSignal<
    | WalletInfoWithOpenMethod
    | {
          openMethod: WalletOpenMethod;
      }
    | null
>(lastSelectedWalletInfoStorage?.getLastSelectedWalletInfo() || null);

export const setLastSelectedWalletInfo = (
    walletInfo:
        | WalletInfoWithOpenMethod
        | {
              openMethod: WalletOpenMethod;
          }
        | null
): void => {
    if (!lastSelectedWalletInfoStorage) {
        lastSelectedWalletInfoStorage = new LastSelectedWalletInfoStorage();
    }

    if (walletInfo) {
        lastSelectedWalletInfoStorage.setLastSelectedWalletInfo(walletInfo);
    } else {
        lastSelectedWalletInfoStorage.removeLastSelectedWalletInfo();
    }
    _setLastSelectedWalletInfo(walletInfo);
};

export const [action, setAction] = createSignal<Action | null>(null);

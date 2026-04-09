import { createMemo, createSignal } from 'solid-js';
import { WalletInfoWithOpenMethod, WalletOpenMethod } from 'src/models/connected-wallet';
import { LastSelectedWalletInfoStorage } from 'src/storage';
import { ReturnStrategy } from 'src/models';
import { WalletsModalState } from 'src/models/wallets-modal';
import { SingleWalletModalState } from 'src/models/single-wallet-modal';
import { UIWalletInfo } from 'src/app/models/ui-wallet-info';

export type ActionName =
    | 'confirm-transaction'
    | 'transaction-sent'
    | 'transaction-canceled'
    | 'confirm-sign-data'
    | 'data-signed'
    | 'sign-data-canceled'
    | 'confirm-sign-message'
    | 'message-signed'
    | 'sign-message-canceled';

export type Action =
    | BasicAction
    | ConfirmTransactionAction
    | ConfirmSignDataAction
    | ConfirmSignMessageAction;

type BasicAction = {
    name: ActionName;
    openModal: boolean;
    showNotification: boolean;
    sessionId?: string;
    traceId: string;
    executed?: boolean;
};

export type ConfirmTransactionAction = BasicAction & {
    name: 'confirm-transaction';
    returnStrategy: ReturnStrategy;
    twaReturnUrl: `${string}://${string}`;
};

export type ConfirmSignDataAction = BasicAction & {
    name: 'confirm-sign-data';
    returnStrategy: ReturnStrategy;
    twaReturnUrl: `${string}://${string}`;
};

export type ConfirmSignMessageAction = BasicAction & {
    name: 'confirm-sign-message';
    returnStrategy: ReturnStrategy;
    twaReturnUrl: `${string}://${string}`;
};

const successActions: readonly ActionName[] = ['transaction-sent', 'data-signed', 'message-signed'];
const errorActions: readonly ActionName[] = [
    'transaction-canceled',
    'sign-data-canceled',
    'sign-message-canceled'
];
const confirmActions: readonly ActionName[] = [
    'confirm-transaction',
    'confirm-sign-data',
    'confirm-sign-message'
];

export function isExecutedAction(name: ActionName): boolean {
    return (successActions as readonly string[]).includes(name);
}

export function isCanceledAction(name: ActionName): boolean {
    return (errorActions as readonly string[]).includes(name);
}

export function isConfirmAction(name: ActionName): boolean {
    return (confirmActions as readonly string[]).includes(name);
}

export const [walletsModalState, setWalletsModalState] = createSignal<WalletsModalState>({
    status: 'closed',
    closeReason: null
});

export const getWalletsModalIsOpened = createMemo(() => walletsModalState().status === 'opened');

export const [singleWalletModalState, setSingleWalletModalState] =
    createSignal<SingleWalletModalState>({
        status: 'closed',
        closeReason: null
    });

export const getSingleWalletModalIsOpened = createMemo(
    () => singleWalletModalState().status === 'opened'
);

export const getSingleWalletModalWalletInfo = createMemo(() => {
    const state = singleWalletModalState();
    if (state.status === 'opened') {
        return state.walletInfo;
    }

    return null;
});

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
export const [lastVisibleWalletsInfo, setLastVisibleWalletsInfo] = createSignal<{
    walletsMenu: 'explicit_wallet' | 'main_screen' | 'other_wallets';
    wallets: UIWalletInfo[];
}>({
    walletsMenu: 'explicit_wallet',
    wallets: []
});
export const [lastOpenedLink, setLastOpenedLink] = createSignal<{
    link: string;
    type?: 'tg_link' | 'external_link';
}>({
    link: ''
});

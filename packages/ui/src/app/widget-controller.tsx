import { render } from 'solid-js/web';

import {
    Action,
    closeWalletsModal,
    lastSelectedWalletInfo,
    openWalletsModal,
    setAction,
    setLastSelectedWalletInfo,
    WalletsModalCloseFn
} from 'src/app/state/modals-state';
import { TonConnectUI } from 'src/ton-connect-ui';
import App from './App';
import { WalletInfoWithOpenMethod, WalletOpenMethod } from 'src/models/connected-wallet';

export const widgetController = {
    openWalletsModal: (onClose: WalletsModalCloseFn): void =>
        void setTimeout(() => openWalletsModal(onClose)),
    closeWalletsModal: (): void => void setTimeout(() => closeWalletsModal('close')),
    setAction: (action: Action): void => void setTimeout(() => setAction(action)),
    clearAction: (): void => void setTimeout(() => setAction(null)),
    getSelectedWalletInfo: ():
        | WalletInfoWithOpenMethod
        | {
              openMethod: WalletOpenMethod;
          }
        | null => lastSelectedWalletInfo(),
    removeSelectedWalletInfo: (): void => setLastSelectedWalletInfo(null),
    renderApp: (root: string, tonConnectUI: TonConnectUI): (() => void) =>
        render(
            () => <App tonConnectUI={tonConnectUI} />,
            document.getElementById(root) as HTMLElement
        )
};

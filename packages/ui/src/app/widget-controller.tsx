import { WalletInfo } from '@tonconnect/sdk';
import { render } from 'solid-js/web';

import {
    Action,
    lastSelectedWalletInfo,
    setAction,
    setWalletsModalOpen
} from 'src/app/state/modals-state';
import { TonConnectUI } from 'src/ton-connect-ui';
import App from './App';

export const widgetController = {
    openWalletsModal: (): void => void setTimeout(() => setWalletsModalOpen(true)),
    closeWalletsModal: (): void => void setTimeout(() => setWalletsModalOpen(false)),
    setAction: (action: Action): void => void setTimeout(() => setAction(action)),
    clearAction: (): void => void setTimeout(() => setAction(null)),
    getSelectedWalletInfo: (): WalletInfo | null => lastSelectedWalletInfo(),
    renderApp: (root: string, tonConnectUI: TonConnectUI): (() => void) =>
        render(
            () => <App tonConnectUI={tonConnectUI} />,
            document.getElementById(root) as HTMLElement
        )
};

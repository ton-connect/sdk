import { render } from 'solid-js/web';

import {
    Action,
    lastSelectedWalletInfo,
    setAction,
    setLastSelectedWalletInfo,
    setSingleWalletModalState,
    setWalletsModalState
} from 'src/app/state/modals-state';
import { TonConnectUI } from 'src/ton-connect-ui';
import App from './App';
import { WalletInfoWithOpenMethod, WalletOpenMethod } from 'src/models/connected-wallet';
import { WalletsModalCloseReason } from 'src/models';
import { WalletInfoRemote, WalletNotSupportFeatureError } from '@tonconnect/sdk';
import { validateWidgetRoot } from './utils/dom-validation';

export const widgetController = {
    openWalletsModal: (): void =>
        void setTimeout(() =>
            setWalletsModalState({
                status: 'opened',
                closeReason: null
            })
        ),
    closeWalletsModal: (reason: WalletsModalCloseReason): void =>
        void setTimeout(() =>
            setWalletsModalState({
                status: 'closed',
                closeReason: reason
            })
        ),
    openSingleWalletModal: (walletInfo: WalletInfoRemote): void => {
        void setTimeout(() =>
            setSingleWalletModalState({
                status: 'opened',
                closeReason: null,
                walletInfo: walletInfo
            })
        );
    },
    closeSingleWalletModal: (reason: WalletsModalCloseReason): void =>
        void setTimeout(() =>
            setSingleWalletModalState({
                status: 'closed',
                closeReason: reason
            })
        ),
    openWalletNotSupportFeatureModal: (cause: WalletNotSupportFeatureError['cause']): void =>
        void setTimeout(() =>
            setWalletsModalState({
                status: 'opened',
                closeReason: null,
                type: 'wallet-not-support-feature',
                requiredFeature: cause.requiredFeature
            })
        ),
    setAction: (action: Action): void => void setTimeout(() => setAction(action)),
    clearAction: (): void => void setTimeout(() => setAction(null)),
    getSelectedWalletInfo: ():
        | WalletInfoWithOpenMethod
        | {
              openMethod: WalletOpenMethod;
          }
        | null => lastSelectedWalletInfo(),
    removeSelectedWalletInfo: (): void => setLastSelectedWalletInfo(null),
    renderApp: (root: string, tonConnectUI: TonConnectUI): (() => void) => {
        // Validate that the widget root element exists before rendering
        if (!validateWidgetRoot(root)) {
            // Return a no-op cleanup function since we can't render
            return () => {};
        }

        return render(
            () => <App tonConnectUI={tonConnectUI} />,
            document.getElementById(root) as HTMLElement
        );
    }
};

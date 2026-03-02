import { render } from 'solid-js/web';

import {
    Action,
    lastSelectedWalletInfo,
    lastVisibleWalletsInfo,
    setAction,
    setLastSelectedWalletInfo,
    setSingleWalletModalState,
    setWalletsModalState
} from 'src/app/state/modals-state';
import { TonConnectUI } from 'src/ton-connect-ui';
import App from './App';
import { WalletInfoWithOpenMethod, WalletOpenMethod } from 'src/models/connected-wallet';
import { WalletsModalCloseReason } from 'src/models';
import {
    OptionalTraceable,
    Traceable,
    WalletInfoRemote,
    WalletNotSupportFeatureError
} from '@tonconnect/sdk';

export const widgetController = {
    openWalletsModal: (
        options?: OptionalTraceable & {
            mode?: 'connect' | 'intent';
            intentUrl?: string;
        }
    ): void =>
        void setTimeout(() =>
            setWalletsModalState(prev => ({
                status: 'opened',
                traceId: options?.traceId ?? prev?.traceId,
                closeReason: null,
                mode: options?.mode ?? prev?.mode ?? 'connect',
                intentUrl: options?.intentUrl ?? prev?.intentUrl
            }))
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
    openWalletNotSupportFeatureModal: (
        cause: WalletNotSupportFeatureError['cause'],
        options: Traceable
    ): void =>
        void setTimeout(() =>
            setWalletsModalState({
                status: 'opened',
                traceId: options.traceId,
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
    getLastVisibleWallets: () => lastVisibleWalletsInfo(),
    removeSelectedWalletInfo: (): void => setLastSelectedWalletInfo(null),
    renderApp: (root: string, tonConnectUI: TonConnectUI): (() => void) =>
        render(
            () => <App tonConnectUI={tonConnectUI} />,
            document.getElementById(root) as HTMLElement
        )
};

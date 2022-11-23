/* @refresh reload */
import { ITonConnect } from '@tonconnect/sdk';
import { render } from 'solid-js/web';

import { setActionModalOpen, setWalletsModalOpen } from 'src/app/state/modals-state';
import { TonConnectUi } from 'src/ton-connect-ui';
import App from './App';

export const widgetController = {
    openWalletsModal: (): void => void setWalletsModalOpen(true),
    closeWalletsModal: (): void => void setWalletsModalOpen(false),
    openActionsModal: (): void => void setActionModalOpen(true),
    closeActionsModal: (): void => void setActionModalOpen(false),
    renderApp: (
        root: string,
        buttonRoot: HTMLElement | null,
        tonConnectUI: TonConnectUi,
        connector: ITonConnect
    ): (() => void) =>
        render(
            () => <App buttonRoot={buttonRoot} tonConnectUI={tonConnectUI} connector={connector} />,
            document.getElementById(root) as HTMLElement
        )
};

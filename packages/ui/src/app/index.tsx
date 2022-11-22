/* @refresh reload */
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
        widgetController: TonConnectUi
    ): (() => void) =>
        render(
            () => <App buttonRoot={buttonRoot} widgetController={widgetController} />,
            document.getElementById(root) as HTMLElement
        )
};

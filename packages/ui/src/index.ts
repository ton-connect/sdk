/* @refresh reload */
import { widgetController } from 'src/app';
import { setThemeState } from 'src/app/state/theme-state';
import { TonConnectUi } from 'src/ton-connect-ui';

export { TonConnectUi, TonConnectUi as default } from './ton-connect-ui';

function dev(): void {
    new TonConnectUi({ buttonRootId: 'button-root', autoConnect: true });
    setTimeout(() => {
        widgetController.openActionsModal('confirm-transaction');
    }, 1000);
    //tc.connectWallet();
    setThemeState({
        accentColor: 'red'
    });
}

dev();

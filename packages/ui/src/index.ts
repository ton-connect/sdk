/* @refresh reload */
import { widgetController } from 'src/app';
import { setThemeState } from 'src/app/state/theme-state';
import { TonConnectUi } from 'src/ton-connect-ui';

export { TonConnectUi, TonConnectUi as default } from './ton-connect-ui';

function dev(): void {
    new TonConnectUi({ buttonRootId: 'button-root', restoreConnection: true });
    setTimeout(() => {
        widgetController.openActionsModal('confirm-transaction');
    }, 500);
    setTimeout(() => {
        widgetController.openActionsModal('transaction-sent');
    }, 1000);

    setTimeout(() => {
        widgetController.openActionsModal('transaction-canceled');
    }, 1500);
    //tc.connectWallet();
    setThemeState({
        accentColor: 'red'
    });
}

dev();

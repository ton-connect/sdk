/* @refresh reload */
import { setThemeState } from 'src/app/state/theme-state';
import { TonConnectUi } from 'src/ton-connect-ui';

export { TonConnectUi, TonConnectUi as default } from './ton-connect-ui';

async function dev(): Promise<void> {
    const tc = new TonConnectUi({ buttonRootId: 'button-root', restoreConnection: false });
    /*setTimeout(() => {
        widgetController.openActionsModal('confirm-transaction');
    }, 500);
    setTimeout(() => {
        widgetController.openActionsModal('transaction-sent');
    }, 1000);

    setTimeout(() => {
        widgetController.openActionsModal('transaction-canceled');
    }, 1500);*/
    try {
        const wallet = await tc.connectWallet();
        console.log(wallet);
    } catch (e) {
        console.log(e);
    }
    setThemeState({
        accentColor: 'red'
    });
}

dev();

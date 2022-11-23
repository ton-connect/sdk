/* @refresh reload */
import { setThemeState } from 'src/app/state/theme-state';
import { TonConnectUi } from 'src/ton-connect-ui';

export { TonConnectUi, TonConnectUi as default } from './ton-connect-ui';

function dev(): void {
    document.body.insertAdjacentHTML(
        'afterbegin',
        `<div id="button-root" style="float: right; margin: 20px;"></div>`
    );
    new TonConnectUi({ buttonRootId: 'button-root', autoConnect: true });
    //tc.connectWallet();
    setThemeState({
        accentColor: 'red'
    });
}

dev();

/* @refresh reload */
import { setThemeState } from 'src/app/state/theme-state';
import { TonConnectUi } from 'src/ton-connect-ui';

export { TonConnectUi, TonConnectUi as default } from './ton-connect-ui';

function dev(): void {
    document.body.insertAdjacentHTML(
        'afterbegin',
        `<div id="button-root" style="float: right; margin: 20px;"></div>`
    );
    const tc = new TonConnectUi({ buttonRootId: 'button-root' });
    tc.connectWallet();
    (window as any).openWallet = tc.connectWallet.bind(tc);
    setThemeState({
        accentColor: 'red'
    });
}

dev();

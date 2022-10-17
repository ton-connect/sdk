/* @refresh reload */
import { setThemeState } from 'src/app/state/theme-state';
import { TonConnectUi } from 'src/ton-connect-ui';

export { TonConnectUi, TonConnectUi as default } from './ton-connect-ui';

function dev(): void {
    const tc = new TonConnectUi();
    tc.connectWallet();
    setThemeState({
        accentColor: 'red'
    });
}

dev();

/* @refresh reload */
import { TonConnectUi } from 'src/ton-connect-ui';

export { TonConnectUi, TonConnectUi as default } from './ton-connect-ui';

function dev(): void {
    const tc = new TonConnectUi();
    tc.connectWallet();
}

dev();

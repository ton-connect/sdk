/* @refresh reload */
import { TonConnectUI } from 'src/ton-connect-ui';
import { THEME } from 'src/models';
import { SendTransactionRequest, TonConnect } from '@tonconnect/sdk';

async function dev(): Promise<void> {
    const connector = new TonConnect({
        manifestUrl: 'https://demo-dapp.walletbot.net/demo-dapp/tonconnect-manifest.json'
    });
    const tonConnectUI = new TonConnectUI({
        connector,
        buttonRootId: 'button-root',
        actionsConfiguration: {
            modals: ['error'],
            notifications: ['before'],
            twaReturnUrl: 'https://google.com'
        },
        uiPreferences: {
            theme: THEME.DARK,
            borderRadius: 'm'
        },
        language: 'ru',
        restoreConnection: true,
        /*walletsListConfiguration: {
            includeWallets: [
                {
                    name: 'Wallet',
                    bridgeUrl: `https://bridge.tonapi.io/bridge`,
                    universalLink: 'https://t.me/wallet',
                    aboutUrl: '',
                    imageUrl: 'https://tonkeeper.com/assets/tonconnect-icon.png',
                    platforms: ['ios']
                }
            ]
        }*/
    });

    /*tonConnectUI.setConnectRequestParameters({ state: 'loading' });

    setInterval(() => {
        tonConnectUI.setConnectRequestParameters({
            state: 'ready',
            value: { tonProof: 'tonProofPayload' + Math.random().toString() }
        });
    }, 3000);*/

    tonConnectUI.onStatusChange(wallet => {
        document.getElementById('content')!.textContent = wallet ? JSON.stringify(wallet) : wallet;
    });

    /*    tonConnectUI.uiOptions = {
        actionsConfiguration: {
            returnStrategy: 'https://google.com'
        }
    };*/

    /*setTimeout(() => {
        tc.uiOptions = {
            uiPreferences: {
                borderRadius: 'none'
            }
        };
    }, 1500);

    setTimeout(() => {
        tc.uiOptions = {
            uiPreferences: {
                theme: THEME.LIGHT
            }
        };
    }, 3000);*/

    // else show modal and ask user to select a wallet

    /* setTimeout(() => {
        widgetController.openActionsModal('confirm-transaction');
    }, 500);
    setTimeout(() => {
        widgetController.openActionsModal('transaction-sent');
    }, 1000); */

    document.getElementById('send-tx')!.onclick = () => {
        const defaultTx: SendTransactionRequest = {
            validUntil: Math.round(Date.now() / 1000) + 1000,
            messages: [
                {
                    address: '0:4d5c0210b35daddaa219fac459dba0fdefb1fae4e97a0d0797739fe050d694ca',
                    amount: '1000000'
                }
            ]
        };

        tonConnectUI.sendTransaction(defaultTx, {
            modals: 'all',
            notifications: 'all'
        });
    };

    //  tc.connectWallet();
    /*
    setTimeout(() => {
        tc.uiOptions = {
            language: 'ru',
            theme: THEME.DARK
        };
    }, 0);
    setTimeout(() => {
        widgetController.openActionsModal('confirm-transaction');
    }, 500);
    setTimeout(() => {
        widgetController.openActionsModal('transaction-sent');
    }, 1000);

    setTimeout(() => {
        widgetController.openActionsModal('transaction-canceled');
    }, 1500);*/
    /*try {
        await tc.connectWallet();

        const defaultTx = {
            validUntil: Date.now() + 1000000,
            messages: [
                {
                    address: '0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F',
                    amount: '20000000'
                },
                {
                    address: '0:E69F10CC84877ABF539F83F879291E5CA169451BA7BCE91A37A5CED3AB8080D3',
                    amount: '60000000'
                }
            ]
        };

        const uiConfig = {
            showModalBefore: true,
            showSuccessModalAfter: true,
            showErrorModalAfter: true
        };

        await tc.sendTransaction(defaultTx, uiConfig);
    } catch (e) {
        console.log(e);
    }*/
}

setTimeout(dev, 500);

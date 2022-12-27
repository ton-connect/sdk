/* @refresh reload */
import { TonConnectUI } from 'src/ton-connect-ui';
import { THEME } from 'src/models/THEME';
import { SendTransactionRequest } from '@tonconnect/sdk';

async function dev(): Promise<void> {
    const tc = new TonConnectUI({
        buttonRootId: 'button-root',
        restoreConnection: true,
        manifestUrl: 'https://ton-connect.github.io/demo-dapp/tonconnect-manifest.json',
        theme: THEME.LIGHT
    });

    const tonConnectUI = new TonConnectUI({
        manifestUrl: 'https://<YOUR_APP_URL>/tonconnect-manifest.json',
        buttonRootId: '<YOUR_CONNECT_BUTTON_ANCHOR_ID>'
    });

    /* setTimeout(() => {
        widgetController.openActionsModal('confirm-transaction');
    }, 500);
    setTimeout(() => {
        widgetController.openActionsModal('transaction-sent');
    }, 1000);
*/
    const defaultTx: SendTransactionRequest = {
        validUntil: Date.now() + 1000000,
        messages: [
            {
                address: '0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F',
                amount: '20000000',
                stateInit: 'base64'
            },
            {
                address: '0:E69F10CC84877ABF539F83F879291E5CA169451BA7BCE91A37A5CED3AB8080D3',
                amount: '60000000'
            }
        ]
    };

    const result = await tonConnectUI.sendTransaction(defaultTx, {
        modals: ['before', 'success', 'error'],
        notifications: ['before', 'success', 'error']
    });

    tc.onStatusChange(wallet => {
        if (wallet) {
            setTimeout(() => {
                tc.sendTransaction(defaultTx);
            }, 1000);
        }
    });

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

dev();

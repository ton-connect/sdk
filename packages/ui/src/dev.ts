/* @refresh reload */
import { TonConnectUI } from 'src/ton-connect-ui';
import { SendTransactionRequest } from '@tonconnect/sdk';
import { THEME } from 'src/models';

async function dev(): Promise<void> {
    const tonConnectUI = new TonConnectUI({
        buttonRootId: 'button-root',
        manifestUrl: 'https://ton-connect.github.io/demo-dapp/tonconnect-manifest.json',
        actionsConfiguration: {
            modals: ['error'],
            notifications: ['before']
        },
        uiPreferences: {
            theme: THEME.DARK
        },
        restoreConnection: true
        /*widgetConfiguration: {
            wallets: {
                excludeWallets: ['OpenMask']
            }
        }*/
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
        window.location.assign('ton-connect://ffdfd');
       /* const defaultTx: SendTransactionRequest = {
            validUntil: Date.now() + 1000000,
            messages: [
                {
                    address: '-1:4d5c0210b35daddaa219fac459dba0fdefb1fae4e97a0d0797739fe050d694ca',
                    amount: '10000000000',
                    payload: 'swapTo%230x8f4Bf8cA0Fc7Ed5FFe58504176736eF92A12CF94'
                }
            ]
        };

        tonConnectUI.sendTransaction(defaultTx, {
            modals: 'all',
            notifications: 'all'
        });*/
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

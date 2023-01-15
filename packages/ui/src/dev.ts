/* @refresh reload */
import { TonConnectUI } from 'src/ton-connect-ui';
import { TonProofItemReplySuccess } from '@tonconnect/protocol';
import { Account } from '@tonconnect/sdk';

let accessToken: string | null = null;

async function getAccountInfo(account: Account): Promise<unknown> {
    const response = await (
        await fetch(`https://demo.tonconnect.dev/dapp/getAccountInfo?network=${account.chain}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
    ).json();

    return response as {};
}
async function generatePayload(): Promise<string> {
    const response = await (
        await fetch(`https://demo.tonconnect.dev/ton-proof/generatePayload`, {
            method: 'POST'
        })
    ).json();

    return response.payload as string;
}
async function checkProof(
    proof: TonProofItemReplySuccess['proof'],
    account: Account
): Promise<void> {
    try {
        const reqBody = {
            address: account.address,
            network: account.chain,
            proof
        };

        const response = await (
            await fetch(`https://demo.tonconnect.dev/ton-proof/checkProof`, {
                method: 'POST',
                body: JSON.stringify(reqBody)
            })
        ).json();

        if (response?.token) {
            accessToken = response.token;
        }
    } catch (e) {
        console.log('checkProof error:', e);
    }
}

const getConnectParametersPromise = generatePayload();
async function dev(): Promise<void> {
    const tonConnectUI = new TonConnectUI({
        buttonRootId: 'button-root',
        manifestUrl: 'https://ton-connect.github.io/demo-dapp/tonconnect-manifest.json',
        actionsConfiguration: {
            modals: ['error'],
            notifications: ['before']
        },
        restoreConnection: false,
        walletsListSource:
            'https://raw.githubusercontent.com/ton-connect/wallets-list/feature/openmask/wallets.json',
        getConnectParameters: async () => {
            const tonProof = await getConnectParametersPromise;
            return {
                tonProof
            };
        }
        /*widgetConfiguration: {
            wallets: {
                excludeWallets: ['OpenMask']
            }
        }*/
    });

    tonConnectUI.onStatusChange(wallet => {
        if (wallet && wallet.connectItems?.tonProof && 'proof' in wallet.connectItems.tonProof) {
            checkProof(wallet.connectItems.tonProof.proof, wallet.account).then(() => {
                getAccountInfo(wallet.account).then(console.log);
            });
        }
    });
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
    }, 1000);
*/
    /*const defaultTx: SendTransactionRequest = {
        validUntil: Date.now() + 1000000,
        messages: [
            {
                address: '0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F',
                amount: '200000'
            }
        ]
    };

    tonConnectUI.onStatusChange(wallet => {
        if (wallet) {
            setTimeout(() => {
                tonConnectUI.sendTransaction(defaultTx, { modals: 'all', notifications: 'all' });
            }, 1000);
        }
    });
*/
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

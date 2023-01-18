# TON Connect UI

⚠️ **API is work in progress right now. Don't use this package in production.**

TonConnect UI is a UI kit for TonConnect SDK. Use it to connect your app to TON wallets via TonConnect protocol.

If you use React for your dapp, take a look at [TonConnect UI React kit](https://github.com/ton-connect/sdk/tree/main/packages/ui-react).

If you want to use TonConnect on the server side, you should use the [TonConnect SDK](https://github.com/ton-connect/sdk/tree/main/packages/sdk).

You can find more details and the protocol specification in the [docs](https://github.com/ton-connect/docs).

---

[Latest API documentation](https://ton-connect.github.io/sdk/modules/_tonconnect_ui.html)

# Getting started

## Installation with cdn
Add the script to your HTML file:
```html
<script src="https://unpkg.com/@tonconnect/ui@latest/dist/tonconnect-ui.min.js"></script>
```

ℹ️ If you don't want auto-update the library, pass concrete version instead of `latest`, e.g.
```html
<script src="https://unpkg.com/@tonconnect/ui@0.0.9/dist/tonconnect-ui.min.js"></script>
```

You can find `TonConnectUI` in global variable `TON_CONNECT_UI`, e.g.
```html
<script>
    const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
        manifestUrl: 'https://<YOUR_APP_URL>/tonconnect-manifest.json',
        buttonRootId: '<YOUR_CONNECT_BUTTON_ANCHOR_ID>'
    });
</script>
```


## Installation with npm
`npm i @tonconnect/ui`

# Usage

## Create TonConnectUI instance
```ts
import TonConnectUI from '@tonconnect/ui'

const tonConnectUI = new TonConnectUI({
    manifestUrl: 'https://<YOUR_APP_URL>/tonconnect-manifest.json',
    buttonRootId: '<YOUR_CONNECT_BUTTON_ANCHOR_ID>'
});
```

See all available options:

[TonConnectUiOptionsWithManifest](https://ton-connect.github.io/sdk/interfaces/_tonconnect_ui.TonConnectUiOptionsWithManifest.html)

[TonConnectUiOptionsWithConnector](https://ton-connect.github.io/sdk/interfaces/_tonconnect_ui.TonConnectUiOptionsWithConnector.html)

## Change options if needed 
```ts
tonConnectUI.uiOptions = {
    language: 'ru',
    uiPreferences: {
        theme: THEME.DARK
    }
};
```

UI element will be rerendered after assignation. You should pass only options that you want to change.
Passed options will be merged with current UI options. Note, that you have to pass object to `tonConnectUI.uiOptions` to keep reactivity.

DON'T do this:
```ts
/* WRONG, WILL NOT WORK */ tonConnectUI.uiOptions.language = 'ru'; 
```

[See all available options](https://ton-connect.github.io/sdk/interfaces/_tonconnect_ui.TonConnectUiOptions.html)

## Fetch wallets list
```ts
const walletsList = await tonConnectUI.getWallets();

/* walletsList is 
{
    name: string;
    imageUrl: string;
    tondns?: string;
    aboutUrl: string;
    universalLink?: string;
    deepLink?: string;
    bridgeUrl?: string;
    jsBridgeKey?: string;
    injected?: boolean; // true if this wallet is injected to the webpage
    embedded?: boolean; // true if the dapp is opened inside this wallet's browser
}[] 
 */
```

or

```ts
const walletsList = await TonConnectUI.getWallets();
```

## Call connect
"TonConnect UI connect button" (which is added at `buttonRootId`) automatically handles clicks and calls connect.
But you are still able to open "connect modal" programmatically, e.g. after click on your custom connect button.

```ts
const connectedWallet = await tonConnectUI.connectWallet();
```

If there is an error while wallet connecting, `TonConnectUIError` or `TonConnectError` will be thrown depends on situation.

## Get current connected Wallet and WalletInfo
You can use special getters to read current connection state. Note that this getter only represents current value, so they are not reactive. 
To react and handle wallet changes use `onStatusChange` mathod.

```ts
    const currentWallet = tonConnectUI.wallet;
    const currentWalletInfo = tonConnectUI.walletInfo;
    const currentAccount = tonConnectUI.account;
    const currentIsConnectedStatus = tonConnectUI.connected;
```

## Subscribe to the connection status changes
```js
const unsubscribe = tonConnectUI.onStatusChange(
    walletAndwalletInfo => {
        // update state/reactive variables to show updates in the ui
    } 
);

// call `unsubscribe()` later to save resources when you don't need to listen for updates anymore.
```

## Disconnect wallet
Call to disconnect the wallet.

```ts
await tonConnectUI.disconnect();
```

## Send transaction
Wallet must be connected when you call `sendTransaction`. Otherwise, an error will be thrown.


```ts
const transaction = {
    validUntil: Date.now() + 1000000,
    messages: [
        {
            address: "0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F",
            amount: "20000000",
            stateInit: "base64bocblahblahblah==" // just for instance. Replace with your transaction initState or remove
        },
        {
            address: "0:E69F10CC84877ABF539F83F879291E5CA169451BA7BCE91A37A5CED3AB8080D3",
            amount: "60000000",
            payload: "base64bocblahblahblah==" // just for instance. Replace with your transaction payload or remove
        }
    ]
}

try {
    const result = await tonConnectUI.sendTransaction(transaction);

    // you can use signed boc to find the transaction 
    const someTxData = await myAppExplorerService.getTransaction(result.boc);
    alert('Transaction was sent successfully', someTxData);
} catch (e) {
    console.error(e);
}
```

`sendTransaction` will automatically render informational modals and notifications. You can change its behaviour:

```ts
const result = await tonConnectUI.sendTransaction(defaultTx, {
    modals: ['before', 'success', 'error'],
    notifications: ['before', 'success', 'error']
});
```

Default configuration is: 
```ts
const defaultBehaviour = {
    modals: ['before'],
    notifications: ['before', 'success', 'error']
}
```

## Detect end of the connection restoring process
Before restoring previous connected wallet TonConnect has to set up SSE connection with bridge, so you have to wait a little while connection restoring.
If you need to update your UI depending on if connection is restoring, you can use `tonConnectUI.connectionRestored` promise.

Promise that resolves after end of th connection restoring process (promise will fire after `onStatusChange`, so you can get actual information about wallet and session after when promise resolved).
Resolved value `true`/`false` indicates if the session was restored successfully.


```ts
tonConnectUI.connectionRestored.then(restored => {
    if (restored) {
        console.log(
            'Connection restored. Wallet:',
            JSON.stringify({
                ...tonConnectUI.wallet,
                ...tonConnectUI.walletInfo
            })
        );
    } else {
        console.log('Connection was not restored.');
    }
});
```

## UI customisation
TonConnect UI provides an interface that should be familiar and recognizable to the user when using various apps. 
However, the app developer can make changes to this interface to keep it consistent with the app interface.

### Customise UI using tonconnectUI.uiOptions
All such updates are reactive -- change `tonconnectUI.uiOptions` and changes will be applied immediately.  

[See all available options](https://ton-connect.github.io/sdk/interfaces/_tonconnect_ui.UIPreferences.html)

#### Change border radius
There are three border-radius modes: `'m'`, `'s'` and `'none'`. Default is `'m'`. You can change it via tonconnectUI.uiOptions, or set on tonConnectUI creating:

```ts
/* Pass to the constructor */
const tonConnectUI = new TonConnectUI({
    manifestUrl: 'https://<YOUR_APP_URL>/tonconnect-manifest.json',
    uiPreferences: {
        borderRadius: 's'
    }
});


/* Or update dynamically */
tonConnectUI.uiOptions = {
        uiPreferences: {
            borderRadius: 's'
        }
    };
```

Note, that `uiOptions` is a setter which will merge new options with previous ones. So you doesn't need to merge it explicitly. Just pass changed options.
```ts
/* DON'T DO THIS. SEE DESCRIPTION ABOVE */
tonConnectUI.uiOptions = {
        ...previousUIOptions,
        uiPreferences: {
            borderRadius: 's'
        }
    };

/* Just pass changed property */
tonConnectUI.uiOptions = {
    uiPreferences: {
        borderRadius: 's'
    }
};
```

#### Change theme
You can set fixed theme: `'THEME.LIGHT'` or `'THEME.DARK'`, or use system theme. Default theme is system.

```ts
import { THEME } from '@tonconnect/ui';

tonConnectUI.uiOptions = {
        uiPreferences: {
            theme: THEME.DARK
        }
    };
```

You also can set `'SYSTEM'` theme:
```ts
tonConnectUI.uiOptions = {
        uiPreferences: {
            theme: 'SYSTEM'
        }
    };
```

You can set theme in the constructor if needed:
```ts
import { THEME } from '@tonconnect/ui';

const tonConnectUI = new TonConnectUI({
    manifestUrl: 'https://<YOUR_APP_URL>/tonconnect-manifest.json',
    uiPreferences: {
        theme: THEME.DARK
    }
});
```

#### Change colors scheme
You can redefine all colors scheme for each theme or change some colors. Just pass colors that you want to change.

```ts
tonConnectUI.uiOptions = {
        uiPreferences: {
            colorsSet: {
                [THEME.DARK]: {
                    connectButton: {
                        background: '#29CC6A'
                    }
                }
            }
        }
    };
```

You can change colors for both themes at the same time:

```ts
tonConnectUI.uiOptions = {
        uiPreferences: {
            colorsSet: {
                [THEME.DARK]: {
                    connectButton: {
                        background: '#29CC6A'
                    }
                },
                [THEME.LIGHT]: {
                    text: {
                        primary: '#FF0000'
                    }
                }
            }
        }
    };

```

You can set colors scheme in the constructor if needed:
```ts
import { THEME } from '@tonconnect/ui';

const tonConnectUI = new TonConnectUI({
    manifestUrl: 'https://<YOUR_APP_URL>/tonconnect-manifest.json',
    uiPreferences: {
        colorsSet: {
            [THEME.DARK]: {
                connectButton: {
                    background: '#29CC6A'
                }
            }
        }
    }
});
```

[See all available options](https://ton-connect.github.io/sdk/interfaces/_tonconnect_ui.PartialColorsSet.html)

#### Combine options
It is possible to change all required options at the same time:

```ts
tonConnectUI.uiOptions = {
        uiPreferences: {
            theme: THEME.DARK,
            borderRadius: 's',
            colorsSet: {
                [THEME.DARK]: {
                    connectButton: {
                        background: '#29CC6A'
                    }
                },
                [THEME.LIGHT]: {
                    text: {
                        primary: '#FF0000'
                    }
                }
            }
        }
    };
```


### Direct css customisation
It is not recommended to customise TonConnect UI elements via css as it may confuse the user when looking for known and familiar UI elements such as connect button/modals.
However, it is possible if needed. You can add css styles to the specified selectors of the UI element. See list of selectors in the table below:

| Element                              | Selector                         | Element description                                                                                                   |
|--------------------------------------|----------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| Connect wallet modal container       | `#tc-wallets-modal-container`    | Container of the modal window that opens when you click on the "connect wallet" button.                               |
| Select wallet modal content          | `#tc-wallets-modal`              | Content of the modal window with wallet selection.                                                                    |
| QR-code modal content                | `#tc-qr-modal`                   | Content of the modal window with QR-code.                                                                             |
| Action modal container               | `#tc-actions-modal-container`    | Container of the modal window that opens when you call `sendTransaction` or other action.                             |
| Confirm action modal content         | `#tc-confirm-modal`              | Content of the modal window asking for confirmation of the action in the wallet.                                      |
| "Transaction sent" modal content     | `#tc-transaction-sent-modal`     | Content of the modal window informing that the transaction was successfully sent.                                     |
| "Transaction canceled" modal content | `#tc-transaction-canceled-modal` | Content of the modal window informing that the transaction was not sent.                                              |
| "Connect Wallet" button              | `#tc-connect-button`             | "Connect Wallet" button element.                                                                                      |
| Wallet menu loading button           | `#tc-connect-button-loading`     | Button element which appears instead of "Connect Wallet" and dropdown menu buttons while restoring connection process |
| Wallet menu dropdown button          | `#tc-dropdown-button`            | Wallet menu button -- host of the dropdown wallet menu (copy address/disconnect).                                     |
| Wallet menu dropdown container       | `#tc-dropdown-container`         | Container of the dropdown that opens when you click on the "wallet menu" button with ton address.                     |
| Wallet menu dropdown content         | `#tc-dropdown`                   | Content of the dropdown that opens when you click on the "wallet menu" button with ton address.                       |
| Notifications container              | `#tc-notifications`              | Container of the actions notifications.                                                                               |


## Customize the list of displayed wallets
You can customize the list of displayed wallets: change order, exclude wallets or add custom wallets.


### Redefine wallets list
Pass an array of the wallet's names and custom wallets. Array items order will be applied to the wallets in modal window.  

You can define custom wallet with `jsBridgeKey` (wallet = browser extension or there is a wallet dapp browser) or with `bridgeUrl` and `universalLink` pair (for http-connection compatible wallets), or pass all of these properties. 
```ts
import { UIWallet } from '@tonconnect/ui';

const customWallet: UIWallet = {
    name: '<CUSTOM_WALLET_NAME>',
    imageUrl: '<CUSTOM_WALLET_IMAGE_URL>',
    aboutUrl: '<CUSTOM_WALLET_ABOUT_URL>',
    jsBridgeKey: '<CUSTOM_WALLET_JS_BRIDGE_KEY>',
    bridgeUrl: '<CUSTOM_WALLET_HTTP_BRIDGE_URL>',
    universalLink: '<CUSTOM_WALLET_UNIVERSAL_LINK>'
};

tonConnectUI.uiOptions = {
        walletsList: {
            wallets: ['tonkeeper', 'openmask', customWallet]
        }
    };
```

### Modify default wallets list
Exclude some wallets with `excludeWallets` property.
Include custom wallets with `includeWallets` property.
Setup place where custom wallets will appear in the all wallets list with `includeWalletsOrder`. Default value id `'end''`. 


```ts
import { UIWallet } from '@tonconnect/ui';

const customWallet: UIWallet = {
    name: '<CUSTOM_WALLET_NAME>',
    imageUrl: '<CUSTOM_WALLET_IMAGE_URL>',
    aboutUrl: '<CUSTOM_WALLET_ABOUT_URL>',
    jsBridgeKey: '<CUSTOM_WALLET_JS_BRIDGE_KEY>',
    bridgeUrl: '<CUSTOM_WALLET_HTTP_BRIDGE_URL>',
    universalLink: '<CUSTOM_WALLET_UNIVERSAL_LINK>'
};

 tonConnectUI.uiOptions = {
        walletsList: {
            excludeWallets: ['openmask'],
            includeWallets: [customWallet],
            includeWalletsOrder: 'start'
        }
    };
```

[See all available options](https://ton-connect.github.io/sdk/types/_tonconnect_ui.WalletsListConfiguration.html)


## Add connect request parameters (ton_proof)
Pass `getConnectParameters` async function to the `TonConnectUI` constructor. This callback will be called after `connectWallet` method call or `Connect Button` click before wallets list render.

In other words, if `getConnectParameters` is passed, there will be a following steps:
1. User clicks to the 'Connect Wallet' button, or `connectWallet` method is called
2. Wallets modal opens
3. Loader renders in the center of the modal
4. TonConnectUI calls `getConnectParameters` and waits while it resolves
5. Wallets list renders in the center of the modal

Note that there is no any caching for `getConnectParameters` -- every time wallets modal opens there will be the 5 steps above.

If you have to make a http-request to your backend it this case, it is better to do it after app initialization (if possible) and return (probably completed) promise from the `getConnectParameters` to reduce loading time for the user.

```ts
const tonProofPayloadPromise = getTonProofFromYourBackend(); // will be executed during app initialization
                                                             // don't forget to manage to refetch payload from your backend if needed

const tonConnectUI = new TonConnectUI({
    manifestUrl: 'https://<YOUR_APP_URL>/tonconnect-manifest.json',
    buttonRootId: '<YOUR_CONNECT_BUTTON_ANCHOR_ID>',
    getConnectParameters: async () => {
        const tonProof = await tonProofPayloadPromise; // will be executed every time when wallets modal is opened. It is recommended to make an http-request in advance
        return {                                         
            tonProof
        };
    }
});
```

You can find `ton_proof` result in the `wallet` object when wallet will be connected:
```ts
tonConnectUI.onStatusChange(wallet => {
        if (wallet && wallet.connectItems?.tonProof && 'proof' in wallet.connectItems.tonProof) {
            checkProofInYourBackend(wallet.connectItems.tonProof.proof);
        }
    });
```

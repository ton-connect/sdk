# TON Connect UI

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

You can also modify this behaviour for all actions calls using `uiOptions` setter:
```ts
tonConnectUI.uiOptions = {
        actionsConfiguration: {
            modals: ['before', 'success', 'error'],
            notifications: ['before', 'success', 'error']
        }
    };
```

## Add the return strategy

Return strategy (optional) specifies return strategy for the deeplink when user signs/declines the request.

'back' (default) means return to the app which initialized deeplink jump (e.g. browser, native app, ...),
'none' means no jumps after user action;
a URL: wallet will open this URL after completing the user's action. Note, that you shouldn't pass your app's URL if it is a webpage. This option should be used for native apps to work around possible OS-specific issues with 'back' option.

You can set it globally with `uiOptions` setter, and it will be applied for connect request and all subsequent actions (send transaction/...).

```ts
tonConnectUI.uiOptions = {
        actionsConfiguration: {
            returnStrategy: 'none'
        }
    };
```

Or you can set it directly when you send a transaction (will be applied only for this transaction request)
```ts
const result = await tonConnectUI.sendTransaction(defaultTx, {
    returnStrategy: '<protocol>://<your_return_url>' // Note, that you shouldn't pass your app's URL if it is a webpage.
     // This option should be used for native apps to work around possible OS-specific issues with 'back' option.
});
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

UI components:

| Element                               | Selector                                      | Element description                                                                                                   |
|---------------------------------------|-----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| Connect wallet modal container        | `[data-tc-wallets-modal-container="true"]`    | Container of the modal window that opens when you click on the "connect wallet" button.                               |
| Select wallet mobile modal content    | `[data-tc-wallets-modal-mobile="true"]`       | Content of the mobile modal window with wallet selection.                                                             |
| Select wallet desktop modal content   | `[data-tc-wallets-modal-desktop="true"]`      | Content of the desktop window with wallet selection.                                                                  |
| Desktop Universal QR content          | `[data-tc-universal-qr-desktop="true"]`       | Universal QR page content under the tab bar in the desktop wallets selection modal window.                            |
| Desktop wallets list content          | `[data-tc-select-wallet-desktop="true"]`      | Wallets list page content under the tab bar in the desktop wallets selection modal window.                            |
| Concrete wallet QR-code modal content | `[data-tc-wallet-qr-modal-desktop="true"]`    | Content of the modal window with the concrete wallet QR-code.                                                         |
| Action modal container                | `[data-tc-actions-modal-container="true"]`    | Container of the modal window that opens when you call `sendTransaction` or other action.                             |
| Confirm action modal content          | `[data-tc-confirm-modal="true"]`              | Content of the modal window asking for confirmation of the action in the wallet.                                      |
| "Transaction sent" modal content      | `[data-tc-transaction-sent-modal="true"]`     | Content of the modal window informing that the transaction was successfully sent.                                     |
| "Transaction canceled" modal content  | `[data-tc-transaction-canceled-modal="true"]` | Content of the modal window informing that the transaction was not sent.                                              |
| "Connect Wallet" button               | `[data-tc-connect-button="true"]`             | "Connect Wallet" button element.                                                                                      |
| Wallet menu loading button            | `[data-tc-connect-button-loading="true"]`     | Button element which appears instead of "Connect Wallet" and dropdown menu buttons while restoring connection process |
| Wallet menu dropdown button           | `[data-tc-dropdown-button="true"]`            | Wallet menu button -- host of the dropdown wallet menu (copy address/disconnect).                                     |
| Wallet menu dropdown container        | `[data-tc-dropdown-container="true"]`         | Container of the dropdown that opens when you click on the "wallet menu" button with ton address.                     |
| Wallet menu dropdown content          | `[data-tc-dropdown="true"]`                   | Content of the dropdown that opens when you click on the "wallet menu" button with ton address.                       |
| Notifications container               | `[data-tc-list-notifications="true"]`         | Container of the actions notifications.                                                                               |
| Notification confirm                  | `[data-tc-notification-confirm="true"]`       | Confirmation notification element.                                                                                    |
| Notification tx sent                  | `[data-tc-notification-tx-sent="true"]`       | Transaction sent notification element.                                                                                |
| Notification cancelled tx             | `[data-tc-notification-tx-cancelled="true"]`  | Cancelled transaction notification element.                                                                           |

---

Basic UI elements:

| Element                        | Selector                        |
|--------------------------------|---------------------------------|
| Button                         | `[data-tc-button="true"]`       |
| Icon-button                    | `[data-tc-icon-button="true"]`  |
| Modal window                   | `[data-tc-modal="true"]`        |
| Notification                   | `[data-tc-notification="true"]` |
| Tab bar                        | `[data-tc-tab-bar="true"]`      |
| H1                             | `[data-tc-h1="true"]`           |
| H2                             | `[data-tc-h2="true"]`           |
| H3                             | `[data-tc-h3="true"]`           |
| Text                           | `[data-tc-text="true"]`         |
| Wallet-item                    | `[data-tc-wallet-item="true"]`  |


## Customize the list of displayed wallets
You can customize the list of displayed wallets: change order, exclude wallets or add custom wallets.


### Extend wallets list
Pass custom wallets array to extend the wallets list. Passed wallets will be added to the end of the original wallets list.  

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
    walletsListConfiguration: {
        includeWallets: [customWallet]
    }
}
```

## Add connect request parameters (ton_proof)
Use `tonConnectUI.setConnectRequestParameters` function to pass your connect request parameters.

This function takes one parameter:

Set state to 'loading' while you are waiting for the response from your backend. If user opens connect wallet modal at this moment, he will see a loader.
```ts
tonConnectUI.setConnectRequestParameters({
    state: 'loading'
});
```

or

Set state to 'ready' and define `tonProof` value. Passed parameter will be applied to the connect request (QR and universal link).
```ts
tonConnectUI.setConnectRequestParameters({
    state: 'ready',
    value: {
        tonProof: '<your-proof-payload>'
    }
});
```

or 

Remove loader if it was enabled via `state: 'loading'` (e.g. you received an error instead of a response from your backend). Connect request will be created without any additional parameters.
```ts
tonConnectUI.setConnectRequestParameters(null);
```


You can call `tonConnectUI.setConnectRequestParameters` multiple times if your tonProof payload has bounded lifetime (e.g. you can refresh connect request parameters every 10 minutes). 


```ts
// enable ui loader
tonConnectUI.setConnectRequestParameters({ state: 'loading' });

// fetch you tonProofPayload from the backend
const tonProofPayload: string | null = await fetchTonProofPayloadFromBackend();

if (!tonProofPayload) {
    // remove loader, connect request will be without any additional parameters
    tonConnectUI.setConnectRequestParameters(null);
} else {
    // add tonProof to the connect request
    tonConnectUI.setConnectRequestParameters({
        state: "ready",
        value: { tonProof: tonProofPayload }
    });
}

```


You can find `ton_proof` result in the `wallet` object when wallet will be connected:
```ts
tonConnectUI.onStatusChange(wallet => {
        if (wallet && wallet.connectItems?.tonProof && 'proof' in wallet.connectItems.tonProof) {
            checkProofInYourBackend(wallet.connectItems.tonProof.proof);
        }
    });
```

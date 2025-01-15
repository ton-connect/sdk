# TON Connect UI

TonConnect UI is a UI kit for TonConnect SDK. Use it to connect your app to TON wallets via TonConnect protocol.

If you use React for your dapp, take a look at [TonConnect UI React kit](https://github.com/ton-connect/sdk/tree/main/packages/ui-react).

If you want to use TonConnect on the server side, you should use the [TonConnect SDK](https://github.com/ton-connect/sdk/tree/main/packages/sdk).

You can find more details and the protocol specification in the [docs](https://docs.ton.org/develop/dapps/ton-connect/overview).

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
import { TonConnectUI } from '@tonconnect/ui'

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

## Open connect modal
"TonConnect UI connect button" (which is added at `buttonRootId`) automatically handles clicks and calls connect.
But you are still able to open "connect modal" programmatically, e.g. after click on your custom connect button.

```ts
await tonConnectUI.openModal();
```

This method opens the modal window and returns a promise that resolves after the modal window is opened.

If there is an error while modal opening, `TonConnectUIError` or `TonConnectError` will be thrown depends on situation.

## Close connect modal

```ts
tonConnectUI.closeModal();
```

This method closes the modal window.

## Get current modal state

This getter returns the current state of the modal window. The state will be an object with `status` and `closeReason` properties. The `status` can be either 'opened' or 'closed'. If the modal is closed, you can check the `closeReason` to find out the reason of closing.

```ts
const currentModalState = tonConnectUI.modalState;
```

## Subscribe to the modal window state changes
To subscribe to the changes of the modal window state, you can use the `onModalStateChange` method. It returns a function which has to be called to unsubscribe.

```js
const unsubscribeModal = tonConnectUI.onModalStateChange(
    (state: WalletsModalState) => {
        // update state/reactive variables to show updates in the ui
        // state.status will be 'opened' or 'closed'
        // if state.status is 'closed', you can check state.closeReason to find out the reason
    }
);
```

Call `unsubscribeModal()` later to save resources when you don't need to listen for updates anymore.

## Wallets Modal Control

The `tonConnectUI` provides methods for managing the modal window, such as `openModal()`, `closeModal()` and other, which are designed for ease of use and cover most use cases.

```typescript
const { modal } = tonConnectUI;

// Open and close the modal
await modal.open();
modal.close();

// Get the current modal state
const currentState = modal.state;

// Subscribe and unsubscribe to modal state changes
const unsubscribe = modal.onStateChange(state => { /* ... */ });
unsubscribe();
```

While `tonConnectUI` internally delegates these calls to the `modal`, it is recommended to use the `tonConnectUI` methods for a more straightforward and consistent experience. The `modal` is exposed in case you need direct access to the modal window's state and behavior, but this should generally be avoided unless necessary.

## Open specific wallet

> The methods described in this section are marked as experimental and are subject to change in future releases.

To open a modal window for a specific wallet, use the `openSingleWalletModal()` method. This method accepts the wallet `app_name` as a parameter (please refer to the [wallets-list.json](https://github.com/ton-blockchain/wallets-list/blob/main/wallets-v2.json)) and opens the corresponding wallet modal. It returns a promise that resolves after the modal window is successfully opened.

```typescript
await tonConnectUI.openSingleWalletModal('wallet_identifier');
````

To close the currently open specific wallet modal, use the `closeSingleWalletModal()` method:

```typescript
tonConnectUI.closeSingleWalletModal();
```

To subscribe to the state changes of the specific wallet modal, use the `onSingleWalletModalStateChange((state) => {})` method. It accepts a callback function that will be called with the current modal state.

```typescript
const unsubscribe = tonConnectUI.onSingleWalletModalStateChange((state) => {
    console.log('Modal state changed:', state);
});

// Call `unsubscribe` when you want to stop listening to the state changes
unsubscribe();
````

To get the current state of the specific wallet modal window, use the `singleWalletModalState` property:

```typescript
const currentState = tonConnectUI.singleWalletModalState;
console.log('Current modal state:', currentState);
```

## Get current connected Wallet and WalletInfo
You can use special getters to read current connection state. Note that this getter only represents current value, so they are not reactive. 
To react and handle wallet changes use `onStatusChange` method.

```ts
const currentWallet = tonConnectUI.wallet;
const currentWalletInfo = tonConnectUI.walletInfo;
const currentAccount = tonConnectUI.account;
const currentIsConnectedStatus = tonConnectUI.connected;
```

## Subscribe to the connection status changes

To subscribe to the changes of the connection status, you can use the `onStatusChange` method. It returns a function which has to be called to unsubscribe.

```ts
const unsubscribe = tonConnectUI.onStatusChange(
    walletAndwalletInfo => {
        // update state/reactive variables to show updates in the ui
    } 
);
```

Call `unsubscribe()` later to save resources when you don't need to listen for updates anymore.

## Disconnect wallet
Call to disconnect the wallet.

```ts
await tonConnectUI.disconnect();
```

## Send transaction
Wallet must be connected when you call `sendTransaction`. Otherwise, an error will be thrown.


```ts
const transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
    messages: [
        {
            address: "EQBBJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aA",
            amount: "20000000",
         // stateInit: "base64bocblahblahblah==" // just for instance. Replace with your transaction initState or remove
        },
        {
            address: "EQDmnxDMhId6v1Ofg_h5KR5coWlFG6e86Ro3pc7Tq4CA0-Jn",
            amount: "60000000",
         // payload: "base64bocblahblahblah==" // just for instance. Replace with your transaction payload or remove
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

## Universal links redirecting issues (IOS)
Some operating systems, and especially iOS, have restrictions related to universal link usage. 
For instance, if you try to open a universal link on an iOS device via `window.open`, you can face the following problem:
the mobile browser won't redirect the user to the wallet app and will open the fallback tab instead. 
That's because universal links can only be opened synchronously after a user's action in the browser (button click/...). 
This means that you either can't perform any asynchronous requests after the user clicks an action button in your dapp, either you can't redirect the user to the connected wallet on some devices.

So, by default, if the user's operating system is iOS, they won't be automatically redirected to the wallet after the dapp calls `tonConnectUI.sendTransaction`. 
You can change this behavior using the skipRedirectToWallet option:

```ts
const result = await tonConnectUI.sendTransaction(defaultTx, {
    modals: ['before', 'success', 'error'],
    notifications: ['before', 'success', 'error'],
    skipRedirectToWallet: 'ios' //'ios' (default), or 'never', or 'always'
});
```

<details>
<summary>You can set it globally with `uiOptions` setter, and it will be applied for all actions (send transaction/...).</summary>

```ts
tonConnectUI.uiOptions = {
        actionsConfiguration: {
            skipRedirectToWallet: 'ios'
        }
    };
```

</details>

<details>
<summary>You should use the option `'never'` if there are no any async calls in the action button's click handler before `tonConnectUI.sendTransaction` call</summary>

```ts
// use skipRedirectToWallet: 'never' for better UX
const onClick = async ()  => {
    const txBody = packTxBodySynchrone();
    tonConnectUI.sendTransaction(txBody, { skipRedirectToWallet: 'never' });

    const myApiResponse = await notifyBackend();
    //...
}
```

```ts
// DON'T use skipRedirectToWallet: 'never', you should use skipRedirectToWallet: 'ios' 
const onClick = async ()  => {
    const myApiResponse = await notifyBackend();
    
    const txBody = packTxBodySynchrone();
    tonConnectUI.sendTransaction(txBody, { skipRedirectToWallet: 'ios' });
    //...
}
```
</details>

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

## Use inside TMA (Telegram Mini Apps)
TonConnect UI will work in TMA in the same way as in a regular website!
Basically, no changes are required from the dApp's developers. The only thing you have to set is a dynamic return strategy.

Currently, it is impossible for TMA-wallets to redirect back to previous opened TMA-dApp like native wallet-apps do.
It means, that you need to specify the return strategy as a link to your TMA that will be only applied if the dApp is opened in TMA mode.

```ts
tonConnectUI.uiOptions = {
    twaReturnUrl: 'https://t.me/durov'
};
```

In other words, TonConnect UI will automatically handle the return strategy based on the environment. **The following pseudo-code demonstrates the internal logic of TonConnect UI**:

> Please note that you **don't need to add this code to your dApp**. It's just an example of how TonConnect UI processes the return strategy internally.

```ts
let finalReturnStrategy;

// Determine if the provided link opens Telegram (using protocols tg:// or domain t.me).
if (isLinkToTelegram('https://example.com')) {
    // In the Telegram Mini Apps environment,
    if (isInTWA()) {
        // preference is given to 'twaReturnUrl',
        finalReturnStrategy = actionsConfiguration.twaReturnUrl;

        // but if it's not set, fallback to 'returnStrategy'.
        if (!finalReturnStrategy) {
            finalReturnStrategy = actionsConfiguration.returnStrategy;
        }
    }
    // If not in a TMA environment,
    else {
        // the return strategy is set to 'none'.
        finalReturnStrategy = 'none';
    }
}
// When the link does not open Telegram,
else {
    // use the predefined 'returnStrategy'.
    finalReturnStrategy = actionsConfiguration.returnStrategy;
}

// Now, 'finalReturnStrategy' contains the correct strategy based on the link's destination and the dApp's environment.
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

| Element                              | Selector                                            | Element description                                                                                                   |
|--------------------------------------|-----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| Connect wallet modal container       | `[data-tc-wallets-modal-container="true"]`          | Container of the modal window that opens when you click on the "connect wallet" button.                               |
| Mobile universal modal page content  | `[data-tc-wallets-modal-universal-mobile="true"]`   | Content of the general mobile modal page with horizontal list.                                                        |
| Desktop universal modal page content | `[data-tc-wallets-modal-universal-desktop="true"]`  | Content of the universal desktop modal page with QR.                                                                  |
| Mobile selected wallet's modal page  | `[data-tc-wallets-modal-connection-mobile="true"]`  | Content of the selected wallet's modal page on mobile.                                                                |
| Desktop selected wallet's modal page | `[data-tc-wallets-modal-connection-desktop="true"]` | Content of the selected wallet's modal page on desktop.                                                               |
| Wallets list modal page              | `[data-tc-wallets-modal-list="true"]`               | Content of the modal page with all available wallets list (desktop and mobile).                                       |
| Info modal page                      | `[data-tc-wallets-modal-info="true"]`               | Content of the modal page with "What is a wallet information".                                                        |
| Action modal container               | `[data-tc-actions-modal-container="true"]`          | Container of the modal window that opens when you call `sendTransaction` or other action.                             |
| Confirm action modal content         | `[data-tc-confirm-modal="true"]`                    | Content of the modal window asking for confirmation of the action in the wallet.                                      |
| "Transaction sent" modal content     | `[data-tc-transaction-sent-modal="true"]`           | Content of the modal window informing that the transaction was successfully sent.                                     |
| "Transaction canceled" modal content | `[data-tc-transaction-canceled-modal="true"]`       | Content of the modal window informing that the transaction was not sent.                                              |
| "Connect Wallet" button              | `[data-tc-connect-button="true"]`                   | "Connect Wallet" button element.                                                                                      |
| Wallet menu loading button           | `[data-tc-connect-button-loading="true"]`           | Button element which appears instead of "Connect Wallet" and dropdown menu buttons while restoring connection process |
| Wallet menu dropdown button          | `[data-tc-dropdown-button="true"]`                  | Wallet menu button -- host of the dropdown wallet menu (copy address/disconnect).                                     |
| Wallet menu dropdown container       | `[data-tc-dropdown-container="true"]`               | Container of the dropdown that opens when you click on the "wallet menu" button with ton address.                     |
| Wallet menu dropdown content         | `[data-tc-dropdown="true"]`                         | Content of the dropdown that opens when you click on the "wallet menu" button with ton address.                       |
| Notifications container              | `[data-tc-list-notifications="true"]`               | Container of the actions notifications.                                                                               |
| Notification confirm                 | `[data-tc-notification-confirm="true"]`             | Confirmation notification element.                                                                                    |
| Notification tx sent                 | `[data-tc-notification-tx-sent="true"]`             | Transaction sent notification element.                                                                                |
| Notification cancelled tx            | `[data-tc-notification-tx-cancelled="true"]`        | Cancelled transaction notification element.                                                                           |

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


# Tracking

## Track events

Tracker for TonConnect user actions, such as transaction signing, connection, etc.

List of events:
* `connection-started`: when a user starts connecting a wallet.
* `connection-completed`: when a user successfully connected a wallet.
* `connection-error`: when a user cancels a connection or there is an error during the connection process.
* `connection-restoring-started`: when the dApp starts restoring a connection.
* `connection-restoring-completed`: when the dApp successfully restores a connection.
* `connection-restoring-error`: when the dApp fails to restore a connection.
* `disconnection`: when a user starts disconnecting a wallet.
* `transaction-sent-for-signature`: when a user sends a transaction for signature.
* `transaction-signed`: when a user successfully signs a transaction.
* `transaction-signing-failed`: when a user cancels transaction signing or there is an error during the signing process.

If you want to track user actions, you can subscribe to the window events with prefix `ton-connect-ui-`:

```typescript
window.addEventListener('ton-connect-ui-transaction-sent-for-signature', (event) => {
    console.log('Transaction init', event.detail);
});
```

## Use custom event dispatcher

You can use your custom event dispatcher to track user actions. To do this, you need to pass the `eventDispatcher` to the TonConnect constructor:

```typescript
import { TonConnectUI, EventDispatcher, SdkActionEvent, UserActionEvent } from '@tonconnect/ui';

class CustomEventDispatcher implements EventDispatcher<UserActionEvent | SdkActionEvent> {
    public async dispatchEvent(
      eventName: string,
      eventDetails: UserActionEvent | SdkActionEvent
    ): Promise<void> {
        console.log(`Event: ${eventName}, details:`, eventDetails);
    }
}

const eventDispatcher = new CustomEventDispatcher();

const connector = new TonConnectUI({ eventDispatcher });
```

# Troubleshooting

## Android Back Handler

If you encounter any issues with the Android back handler, such as modals not closing properly when the back button is pressed, or conflicts with `history.pushState()` if you are manually handling browser history in your application, you can disable the back handler by setting `enableAndroidBackHandler` to `false`:

```ts
const tonConnectUI = new TonConnectUI({
    // ...
    enableAndroidBackHandler: false
});
```

This will disable the custom back button behavior on Android, and you can then handle the back button press manually in your application.

While we do not foresee any problems arising with the Android back handler, but if you find yourself needing to disable it due to an issue, please describe the problem in on [GitHub Issues](https://github.com/ton-connect/sdk/issues), so we can assist you further.

## Animations not working

If you are experiencing issues with animations not working in your environment, it might be due to a lack of support for the Web Animations API. To resolve this issue, you can use the `web-animations-js` polyfill.

### Using npm

To install the polyfill, run the following command:

```shell
npm install web-animations-js
```

Then, import the polyfill in your project:

```typescript
import 'web-animations-js';
```

### Using CDN

Alternatively, you can include the polyfill via CDN by adding the following script tag to your HTML:

```html
<script src="https://www.unpkg.com/web-animations-js@latest/web-animations.min.js"></script>
```

Both methods will provide a fallback implementation of the Web Animations API and should resolve the animation issues you are facing.

## Warning about 'encoding' module in Next.js

If you are using Next.js and see a warning similar to the following:

```
 ⚠ ./node_modules/node-fetch/lib/index.js
Module not found: Can't resolve 'encoding' in '.../node_modules/node-fetch/lib'

Import trace for requested module:
./node_modules/node-fetch/lib/index.js
./node_modules/@tonconnect/isomorphic-fetch/index.mjs
./node_modules/@tonconnect/sdk/lib/esm/index.mjs
./node_modules/@tonconnect/ui/lib/esm/index.mjs
```

Please note that this is just a warning and should not affect the functionality of your application. If you wish to suppress the warning, you have two options:

1. (Recommended) Wait for us to remove the dependency on `@tonconnect/isomorphic-fetch` in future releases. This dependency will be removed when we drop support for Node.js versions below 18.

2. (Optional) Install the `encoding` package, to resolve the warning:
```shell
npm install encoding
```

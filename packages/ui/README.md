# TON Connect UI

⚠️ **API is work in progress right now. Don't use this package in production.**

TonConnect UI is a UI kit for TonConnect SDK. Use it to connect your app to TON wallets via TonConnect protocol.

If you use React for your dapp, take a look at [TonConnect UI React kit](https://github.com/ton-connect/sdk/tree/main/packages/ui-react).

If you want to use TonConnect on the server side, you should use the [TonConnect SDK](https://github.com/ton-connect/sdk/tree/main/packages/sdk).

You can find more details and the protocol specification in the [docs](https://github.com/ton-connect/docs).

---

[Latest API documentation](https://ton-connect.github.io/sdk/modules/_tonconnect_ui.html)

# Getting started

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
[TonConnectUiOptionsWithManifest](https://ton-connect.github.io/sdk/docs/interfaces/_tonconnect_ui.TonConnectUiOptionsWithManifest.html)
[TonConnectUiOptionsWithConnector](https://ton-connect.github.io/sdk/docs/interfaces/_tonconnect_ui.TonConnectUiOptionsWithConnector.html)

## Change options if needed 
```ts
tonConnectUI.uiOptions = {
    language: 'ru',
    theme: THEME.DARK
};
```

UI element will be rerendered after assignation. You should pass only options that you want to change.
Passed options will be merged with current UI options. Note, that you have to pass object to `tonConnectUI.uiOptions` to keep reactivity.

DON'T do this:
```ts
tonConnectUI.uiOptions.language = 'ru'; // WRONG, WILL NOT WORK 
```

[See all available options](https://ton-connect.github.io/sdk/docs/interfaces/_tonconnect_ui.TonConnectUiOptions.html)

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

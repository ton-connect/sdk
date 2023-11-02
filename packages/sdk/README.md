# TON Connect SDK

Use it to connect your app to TON wallets via TonConnect protocol. 
You can find more details and the protocol specification in the [docs](https://docs.ton.org/develop/dapps/ton-connect/overview).
See the example of sdk usage [here](https://github.com/ton-connect/demo-dapp).

[Latest API documentation](https://ton-connect.github.io/sdk/modules/_tonconnect_sdk.html)

# Getting started
## Installation with cdn
Add the script to your HTML file:
```html
<script src="https://unpkg.com/@tonconnect/sdk@latest/dist/tonconnect-sdk.min.js"></script>
```

ℹ️ If you don't want auto-update the library, pass concrete version instead of `latest`, e.g. 
```html
<script src="https://unpkg.com/@tonconnect/sdk@0.0.34/dist/tonconnect-sdk.min.js"></script>
```

You can find `TonConnect` in global variable `TonConnectSDK`, e.g.
```html
<script>
    const connector = new TonConnectSDK.TonConnect();
</script>
```

## Installation with npm
`npm i @tonconnect/sdk`

# Usage
## Init connector and call restoreConnection. If user connected his wallet before, connector will restore the connection

```ts
import TonConnect from '@tonconnect/sdk';

const connector = new TonConnect();

connector.restoreConnection();
```

## Add the tonconnect-manifest
App needs to have its manifest to pass meta information to the wallet. Manifest is a JSON file named as `tonconnect-manifest.json` following format:

```json
{
  "url": "<app-url>",                        // required
  "name": "<app-name>",                      // required
  "iconUrl": "<app-icon-url>",               // required
  "termsOfUseUrl": "<terms-of-use-url>",     // optional
  "privacyPolicyUrl": "<privacy-policy-url>" // optional
}
```

Best practice is to place the manifest in the root of your app, e.g. `https://myapp.com/tonconnect-manifest.json`. It allows the wallet to handle your app better and improve the UX connected to your app.
Make sure that manifest is available to GET by its URL.

[See details](https://docs.ton.org/develop/dapps/ton-connect/protocol/requests-responses#app-manifest)

If your manifest placed not in the root of your app, you can specify its path:
```ts
const connector = new TonConnect({
    manifestUrl: 'https://myApp.com/assets/tonconnect-manifest.json'
});
```

## Subscribe to the connection status changes
```js
const unsubscribe = connector.onStatusChange(
    walletInfo => {
        // update state/reactive variables to show updates in the ui
    } 
);

// call `unsubscribe()` later to save resources when you don't need to listen for updates anymore.
```

## Fetch wallets list

TonConnect is build to support different wallets. You can fetch all supported wallets list and show a custom wallet selection dialog for user.

```ts
const walletsList = await connector.getWallets();

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

You also can get wallets list using `getWallets` static method:
```ts
const walletsList = await TonConnect.getWallets();
```

### WalletInfo utils and type guards
Following type guards might be helpful for WalletInfos manipulations:

```ts
import {
    isWalletInfoCurrentlyEmbedded,
    isWalletInfoInjectable,
    isWalletInfoCurrentlyInjected,
    isWalletInfoRemote,
    WalletInfo
} from '@tonconnect/sdk';

/* Use for filtration */
const remoteConnectionWalletInfos = walletInfoList.filter(isWalletInfoRemote);

// all wallets that supports injecteble connection (EVEN THOSE THAT ARE NOT INJECTED TO THE CURRENT PAGE) 
const injectableConnectionWalletInfos = walletInfoList.filter(isWalletInfoInjectable);

// wallets that are injected to the current webpage 
const currentlyInjectedWalletInfos = walletInfoList.filter(isWalletInfoCurrentlyInjected);
const embeddedWalletInfo = walletInfoList.find(isWalletInfoCurrentlyEmbedded);

    
/* or use as type guard */
if (isWalletInfoRemote(walletInfo)) {
    connector.connect({
        universalLink: walletInfo.universalLink,
        bridgeUrl: walletInfo.bridgeUrl
    });
    return;
}

if (isWalletInfoCurrentlyInjected(walletInfo)) {
    connector.connect({
        jsBridgeKey: walletInfo.jsBridgeKey
    });
    return;
}
```

## Initialize a wallet connection when user clicks to 'connect' button in your app
### Initialize a remote wallet connection via universal link 

```ts
// Should correspond to the wallet that user selects
const walletConnectionSource = {
    universalLink: 'https://app.tonkeeper.com/ton-connect',
    bridgeUrl: 'https://bridge.tonapi.io/bridge'
}

const universalLink = connector.connect(walletConnectionSource);
```

Then you have to show this link to user as QR code, or use it as a deeplink. You will receive an update in `connector.onStatusChange` when user approves connection in the wallet.

### Initialize injected wallet connection
```ts
// Should correspond to the wallet that user selects
const walletConnectionSource = {
    jsBridgeKey: 'tonkeeper'
}

connector.connect(walletConnectionSource);
```

You will receive an update in `connector.onStatusChange` when user approves connection in the wallet.

### Create unified link
You can create the unified link that could be accepted by any wallet. To do that you should pass an array of http-wallet-connection-sources:

If several wallets have same bridge url, you can pass this url only once.
```ts
const sources = [
    {
        bridgeUrl: 'https://bridge.tonapi.io/bridge' // Tonkeeper
    },
    {
        bridgeUrl: 'https://<OTHER_WALLET_BRIDGE>' // Tonkeeper
    }
];

connector.connect(sources);
```

### Detect embedded wallet
It is recommended not to show a QR code modal if the app is opened inside a wallet's browser. 
You should detect working environment of the app and show appropriate UI.
Check `embedded` property in elements of the wallets list to detect if the app is opened inside a wallet.

```ts
import { isWalletInfoCurrentlyEmbedded, WalletInfoCurrentlyEmbedded } from '@tonconnect/sdk';

// "connect button" click handler.
// Execute this before show wallet selection modal.

const walletsList = await connector.getWallets(); // or use `walletsList` fetched before  

const embeddedWallet = walletsList.find(isWalletInfoCurrentlyEmbedded) as WalletInfoCurrentlyEmbedded;

if (embeddedWallet) {
    connector.connect({ jsBridgeKey: embeddedWallet.jsBridgeKey });
    return;
}

// else show modal and ask user to select a wallet
```

## Send transaction
```ts
if (!connector.connected) {
    alert('Please connect wallet to send the transaction!');
}

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
    const result = await connector.sendTransaction(transaction);
    
    // you can use signed boc to find the transaction 
    const someTxData = await myAppExplorerService.getTransaction(result.boc);
    alert('Transaction was sent successfully', someTxData);
} catch (e) {
    if (e instanceof UserRejectedError) {
        alert('You rejected the transaction. Please confirm it to send to the blockchain');
    } else {
        alert('Unknown error happened', e);
    }
}
```

## Disconnect wallet
Note that if you want to change connected wallet, you should disconnect current one firstly. Also make sure that you've waited for `restoreConnection()` promise resolved before call `disconnect()`;

```ts
if (connector.connected) {
    await connector.disconnect();
}
```
# Utils

## Convert address to user-friendly format
Use `toUserFriendlyAddress` function to convert raw-address to the user-friendly format. You can pass `true` as a second
parameter to make it 'testnet only' (disabled by default).


```ts
import { toUserFriendlyAddress } from '@tonconnect/sdk';

const rawAddress = connector.wallet.account.address; // like '0:abcdef123456789...'
const bouncableUserFriendlyAddress = toUserFriendlyAddress(rawAddress);
const testnetOnlyBouncableUserFriendlyAddress = toUserFriendlyAddress(rawAddress, true);
```

# Backend authorization
To authorize user in your backend with TonConnect you can use following schema:
1. Fetch auth payload from your backend. It might be any random value. Backend must save information that this payload was sent to the client to check payload correctness later.
2. Connect to the wallet when user clicks to the connection button:
```ts
connector.connect(
  walletConnectionSource, 
  { tonProof: "<your-fetched-payload>" }
);
```
Note that you can use `tonProof` only with `connector.connect()` method. This feature is not available in `connector.restoreConnection()`.

3. Read a signed result after user approves connection:
```ts
connector.onStatusChange(wallet => {
    if (!wallet) {
        return;
    }

    const tonProof = wallet.connectItems?.tonProof;

    if (tonProof) {
        if ('proof' in tonProof) {
            // send proof to your backend
            // e.g. myBackendCheckProof(tonProof.proof, wallet.account);
            return;
        }

        console.error(tonProof.error);
    }
});
```
4. Send proof and user's account data to your backend. Backend should check the proof correctness and check that payload inside the proof was generated before. After all checks backend should return an auth token to the client. Notice that `Account` contains the `walletStateInit` property which can be helpful for your backend to get user's public key if user's wallet contract doesn't support corresponding get method.
5. Client saves the auth token in the `localStorage` and use it to access to auth-required endpoints. Client should delete the token when user disconnects the wallet.

[See an example of a dapp using backend authorization](https://github.com/ton-connect/demo-dapp-with-backend). 

[See an example of the dapp backend](https://github.com/ton-connect/demo-dapp-backend). 


# Use with NodeJS
You can use the SDK in frontend apps and in backend apps created with NodeJS. 

## Installation
`npm i @tonconnect/sdk`

## Init connector
When you use the SDK in backend, you have to pass `manifestUrl` and `IStorage` implementation to the TonConnect constructor.

[See more about the manifest](##add-the-tonconnect-manifest).

```ts
import TonConnect from '@tonconnect/sdk';

const storage: IStorage = <your implementation of the IStorage>

const connector = new TonConnect({ manifestUrl, storage });
```

Your storage should implement following interface:
```ts
export interface IStorage {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
}
```

[See details about IStorage in the API documentation](https://ton-connect.github.io/sdk/interfaces/_tonconnect_sdk.IStorage.html).

Other steps are the same as for browser apps.

## Pause and unpause connection
You can pause and unpause HTTP connection using `tonConnect.pauseConnection()` and `tonConnect.unPauseConnection()` to save your server resources.   

```ts
myTelegramBot.userIsOffline(user => {
    const connector = myFunctionGetConnectorByUser(user);
    connector.pauseConnection();  
})

myTelegramBot.userIsOnline(user => {
    const connector = myFunctionGetConnectorByUser(user);
    connector.unPauseConnection();
})
```

# Troubleshooting

## Warning about 'encoding' module in Next.js

If you are using Next.js and see a warning similar to the following:

```
 ⚠ ./node_modules/node-fetch/lib/index.js
Module not found: Can't resolve 'encoding' in '.../node_modules/node-fetch/lib'

Import trace for requested module:
./node_modules/node-fetch/lib/index.js
./node_modules/@tonconnect/isomorphic-fetch/index.mjs
./node_modules/@tonconnect/sdk/lib/esm/index.mjs
```

Please note that this is just a warning and should not affect the functionality of your application. If you wish to suppress the warning, you have two options:

1. (Recommended) Wait for us to remove the dependency on `@tonconnect/isomorphic-fetch` in future releases. This dependency will be removed when we drop support for Node.js versions below 18.

2. (Optional) Install the `encoding` package, to resolve the warning:
```shell
npm install encoding
```

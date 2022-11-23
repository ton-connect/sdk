# TON Connect SDK

⚠️ TonConnect is currently in beta testing. Use it at your own risk.

Use it to connect your app to TON wallets via TonConnect protocol. 
You can find more details and the protocol specification in the [docs](https://github.com/ton-connect/docs).
See the example of sdk usage [here](https://github.com/ton-connect/demo-dapp).

## Get started
`npm i @tonconnect/sdk`

## Init connector and call autoConnect. If user connected his wallet before, connector will restore the connection

```ts
import TonConnect from '@tonconnect/sdk';

const connector = new TonConnect();

connector.restoreConnection();
```

## Subscribe to the connection status changes
```js
connector.onStatusChange(
    walletInfo => {
        // update state/reactive variables to show updates in the ui
    } 
);
```

## Fetch wallets list

TonConnect is build to support different wallets. You can fetch all supported wallets list and show a custom wallet selection dialog for user

```ts
const walletsList = await connector.getWallets();

/* walletsList is 
{
    name: string;
    imageUrl: string;
    tondns?: string;
    aboutUrl: string;
    universalLinkBase?: string;
    bridgeUrl?: string;
    jsBridgeKey?: string;
    injected?: boolean; // true if this wallet is injected to the webpage
    embedded?: boolean; // true if dapp is opened inside this wallet's browser
}[] 
 */
```

## Initialize a wallet connection when user clicks to 'connect' button in your app
### Initialize a remote wallet connection via universal link 

```ts
const walletConnectionSource = {
    universalLinkBase: 'https://app.mycooltonwallet.com',
    bridgeURL: 'https://bridge.mycooltonwallet.com,'
}

const universalLink = connector.connect(walletConnectionSource);
```

Then you have to show this link to user as QR code, or use it as a deeplink. You will receive an update in `connector.onStatusChange` when user approves connection in the wallet

### Initialize injected wallet connection
```ts
const walletConnectionSource = {
    jsBridgeKey: 'tonkeeper'
}

connector.connect(walletConnectionSource);
```

You will receive an update in `connector.onStatusChange` when user approves connection in the wallet

## Send transaction
```ts
if (!connetor.connected) {
    alert('Please connect wallet to send the transaction!');
}

const transaction = {
    valid_until: 1658253458,
    messages: [
        {
            address: "0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F",
            amount: "20000000",
            initState: "base64bocblahblahblah==" // just for instance. Replace with your transaction initState or remove
        },
        {
            address: "0:E69F10CC84877ABF539F83F879291E5CA169451BA7BCE91A37A5CED3AB8080D3",
            amount: "60000000",
            payload: "base64bocblahblahblah==" // just for instance. Replace with your transaction payload or remove
        }
    ]
}

try {
    const result = await connetor.sendTransaction(transaction);
    
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

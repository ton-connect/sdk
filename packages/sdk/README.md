# TON Connect SDK core

⚠️ SDK is work in progress right now.

## Init connector and call autoConnect. If user connected his wallet before, connector will restore connection

```js
import TonConnect from '@tonconnect/sdk';

const connector = new TonConnect();

connector.autoConnect();
```

## Subscribe to the connection status changes
```js
connector.onStatusChange(
    walletInfo => {
        // update state/reactive variables to show updates in the ui
    } 
);
```


## Initialize a wallet connection when user clicks to 'connect' button in your app
### Initialize a remote wallet connection via universal link 

```
const walletConnectionSource = {
    universalLinkBase: 'https://app.mycooltonwallet.com',
    bridgeURL: 'https://bridge.mycooltonwallet.co,'
}

const uniwersalLink = connector.connect(walletConnectionSource);
```

Then you have to show this link to user as QR code, or use it as a deeplink. You will receive update in `connector.onStatusChange` when user approves connection in the wallet

### Initialize injected wallet connection 

```
connector.connect('injected');
```


You will receive update in `connector.onStatusChange` when user approves connection in the wallet

## Send transaction
```js
if (!connetor.connected) {
    alert('Please connect wallet to send the transaction!');
}

const transaction = {
    valid_until: 1658253458,
    messages: [
        {
            address: "0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F",
            amount: "20000000",
            initState: "base64bocblahblahblah==" //deploy contract
        },
        {
            address: "0:E69F10CC84877ABF539F83F879291E5CA169451BA7BCE91A37A5CED3AB8080D3",
            amount: "60000000",
            payload: "base64bocblahblahblah==" //transfer nft to new deployed account 0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F
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

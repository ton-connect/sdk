# TON Connect SDK core

⚠️ API is work in progress right now.

## Init connector and create a universal link

```js
import TonConnect from '@ton-connect/core';

const connector = new TonConnect();

const walletConnectionSource = {
    universalLinkBase: 'https://app.mycooltonwallet.com',
    bridgeLink: 'https://bridge.mycooltonwallet.co,'
}

const uniwersalLink = connector.connect(walletConnectionSource);
```

Then you have to show this link to user as QR code, or use it as a deeplink.


## Subscribe to the connection status changes
```js
connector.onStatusChange(
    walletInfo => {
        // update state/reactive variables to show updates in the ui
        dispatch(updateAccount(walletInfo.account));
    } 
);
```

## Send transaction
```js
if (!connetor.connected) {
    alert('Please connect wallet to send the transaction!');
}

try {
    const result = await connetor.sendTransaction(myTransactionBOC);
    
    // you can use signed boc to find the transaction 
    const someTxData = explorerService.getTransaction(result.boc);
    alert('Transaction was sent successfully', someTxData);
} catch (e) {
    if (e instanceof UserRejectedError) {
        alert('You rejected the transaction. Please confirm it to send to the blockchain');
    } else {
        alert('Unknown error happened', e);
    }
}
```

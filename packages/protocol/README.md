# TON Connect protocol models

ℹ️ If you want to integrate TonConnect to your dApp, you should use [@tonconnect/sdk](https://www.npmjs.com/package/@tonconnect/sdk)

[Latest API documentation](https://ton-connect.github.io/sdk/modules/_tonconnect_protocol.html)

## Summary
Package contains protocol requests, responses and event models and encoding, decoding functions.

You can use it to integrate TonConnect to your wallet app (written with TypeScript).

## Get started

### Install package
`npm i @tonconnect/protocol`

### Use protocol models in your app

```ts
import { AppRequest, RpcMethod, WalletResponse } from '@tonconnect/protocol';

function myWalletAppRequestsHandler<T extends RpcMethod>(request: AppRequest<T>): Promise<WalletResponse<T>> {
    // handle request, ask the user for a confirmation and return WalletResponse
}

```

### Use protocol cryptography in your app

```ts
import { SessionCrypto, WalletMessage, Base64, hexToByteArray } from '@tonconnect/protocol';

function encodeIncommingHTTPBridgeRequest(encryptedMessage: string, from: string): WalletMessage {
    const sessionCrypto = new SessionCrypto(yourStoredSessionReypair);

    const decryptedMessage =
        sessionCrypto.decrypt(
            Base64.decode(bridgeIncomingMessage.message).toUint8Array(),
            hexToByteArray(bridgeIncomingMessage.from)
        );
    
    return  JSON.parse(decryptedMessage);
}
```

### Network identifiers

The package exports `CHAIN` enum with values `MAINNET = '-239'` and `TESTNET = '-3'` representing TON network IDs. The `ChainId` type (`CHAIN | string`) allows using these predefined values or any custom network identifier string, enabling support for custom networks and future network additions without protocol changes.

The `ChainId` is used to specify the desired network when establishing wallet connections (via `TonAddressItem.network` field), and for indicating the network context in transaction sending and data signing operations (like `SignDataPayload.network` field), ensuring that all protocol operations can target the correct network.

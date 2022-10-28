# TON Connect

⚠️ TonConnect is currently in beta testing. Use it at your own risk.

This is the implementation of the TonConnect protocol. You can find more details about TonConnect protocol in the [docs](https://github.com/ton-connect/docs).

Repository contains three packages:
- [@tonconnect/sdk](https://www.npmjs.com/package/@tonconnect/sdk)
- [@tonconnect/protocol](https://www.npmjs.com/package/@tonconnect/protocol)
- @tonconnect/ui

## TON Connect SDK
[github link](https://github.com/ton-connect/sdk/tree/main/packages/sdk)
[npm link](https://www.npmjs.com/package/@tonconnect/sdk)

Use it to connect your app to TON wallets via TonConnect protocol.
You can find the full description in the link above.

## TON Connect protocol models
[github link](https://github.com/ton-connect/sdk/tree/main/packages/protocol)
[npm link](https://www.npmjs.com/package/@tonconnect/protocol)

This package contains protocol requests, responses and event models and encoding, decoding functions.
You can use it to integrate TonConnect to your wallet app (written with TypeScript).
If you want to integrate TonConnect to your dApp, you should use [@tonconnect/sdk](https://www.npmjs.com/package/@tonconnect/sdk).

## TON Connect UI
This package is work in progress right now.
It will allow you to integrate TonConnect to your app easier using our UI elements such as "connect wallet button", "select wallet dialog" and confirmation modals.  

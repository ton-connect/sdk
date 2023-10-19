# TON Connect

This is the implementation of the TonConnect protocol. You can find more details about TonConnect protocol in the [docs](https://docs.ton.org/develop/dapps/ton-connect/overview).

[Latest API documentation](https://ton-connect.github.io/sdk/)

Repository contains following packages:
- [@tonconnect/sdk](https://www.npmjs.com/package/@tonconnect/sdk)
- [@tonconnect/protocol](https://www.npmjs.com/package/@tonconnect/protocol)
- [@tonconnect/ui](https://www.npmjs.com/package/@tonconnect/ui)
- [@tonconnect/ui-react](https://www.npmjs.com/package/@tonconnect/ui-react)

## TON Connect SDK
- [github link](https://github.com/ton-connect/sdk/tree/main/packages/sdk)
- [npm link](https://www.npmjs.com/package/@tonconnect/sdk)
- [API documentation](https://ton-connect.github.io/sdk/modules/_tonconnect_sdk.html)

Use it to connect your app to TON wallets via TonConnect protocol.
You can find the full description in the link above.

## TON Connect protocol models
- [github link](https://github.com/ton-connect/sdk/tree/main/packages/protocol)
- [npm link](https://www.npmjs.com/package/@tonconnect/protocol)
- [API documentation](https://ton-connect.github.io/sdk/modules/_tonconnect_protocol.html)

This package contains protocol requests, responses and event models and encoding, decoding functions.
You can use it to integrate TonConnect to your wallet app (written with TypeScript).
If you want to integrate TonConnect to your dApp, you should use [@tonconnect/sdk](https://www.npmjs.com/package/@tonconnect/sdk).

## TON Connect UI
- [github link](https://github.com/ton-connect/sdk/tree/main/packages/ui)
- [npm link](https://www.npmjs.com/package/@tonconnect/ui)
- [API documentation](https://ton-connect.github.io/sdk/modules/_tonconnect_ui.html)


TonConnect UI is a UI kit for TonConnect SDK. Use it to connect your app to TON wallets via TonConnect protocol.
It allows you to integrate TonConnect to your app easier using our UI elements such as "connect wallet button", "select wallet dialog" and confirmation modals.

## TON Connect UI React
- [github link](https://github.com/ton-connect/sdk/tree/main/packages/ui-react)
- [npm link](https://www.npmjs.com/package/@tonconnect/ui-react)
- [API documentation](https://ton-connect.github.io/sdk/modules/_tonconnect_ui_react.html)


TonConnect UI React is a React UI kit for TonConnect SDK. Use it to connect your app to TON wallets via TonConnect protocol in React apps.

## Development

Follow the instructions in [DEVELOPERS.md](./DEVELOPERS.md) to setup the development environment.

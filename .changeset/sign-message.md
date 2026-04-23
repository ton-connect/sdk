---
'@tonconnect/protocol': minor
'@tonconnect/sdk': minor
'@tonconnect/ui': minor
---

Add `signMessage` method

Wallets can now be asked to sign an internal message without broadcasting it. The signed
BoC is returned to the dApp, which can submit it through a relayer — enabling gasless
(sponsored) transaction flows where the user does not need to hold TON for gas.

The request payload has the same shape as `sendTransaction` (supports both raw
`messages` and structured `items`). Wallets declare support via the `SignMessage`
feature in `DeviceInfo.features`.

---
'@tonconnect/protocol': minor
'@tonconnect/sdk': minor
'@tonconnect/ui': minor
---

Add structured items to `sendTransaction` and `signMessage`

A new `items` field is accepted as an alternative to `messages`. Instead of
constructing raw BoC payloads, dApps describe transfers at a high level and the
wallet handles BoC construction — resolving jetton wallet addresses, building
transfer cells, and estimating gas.

Three item types are supported: `ton`, `jetton`, and `nft`. A request must contain
either `messages` or `items`, never both. Wallets declare supported item types via
the `itemTypes` field in the `SendTransaction` / `SignMessage` feature entries.

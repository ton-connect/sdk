---
'@tonconnect/protocol': minor
'@tonconnect/sdk': minor
'@tonconnect/ui': minor
---

Add embedded requests

An RPC request (`sendTransaction`, `signMessage`, or `signData`) can now be embedded
directly into the connect URL via an `e` query parameter. On mobile this lets the
wallet handle connection and action in a single tap, eliminating the round-trip for
"connect and pay" flows.

In the UI SDK, pass `onConnected` in the request options — the SDK opens the wallet
modal, includes the embedded request in the connect URL, and resolves either from
the connect event (if the wallet supports `EmbeddedRequest`) or by falling back to
the standard bridge flow. The callback receives `context.dispatched` so the dApp
can verify on-chain state before retrying, to avoid duplicate submissions on a
network error.

Wallets declare support via the `EmbeddedRequest` feature in `DeviceInfo.features`.

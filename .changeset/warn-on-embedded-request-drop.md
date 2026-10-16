---
'@tonconnect/sdk': minor
'@tonconnect/ui': patch
---

Warn when an embedded request is dropped for exceeding the universal-link length limit, and centralise the 1024-character cap into a single shared `MAX_UNIVERSAL_LINK_LENGTH` constant.

Previously the embedded request was silently dropped and the dApp only saw `dispatched: false` with no indication that the link size was the reason (#584). `BridgeProvider` now emits a warning in that case. The length cap, which was duplicated across the SDK, the UI (`MAX_LINK_LENGTH`) and the tests, is now exported from the SDK as `MAX_UNIVERSAL_LINK_LENGTH` and reused everywhere so the values cannot drift apart.

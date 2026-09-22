---
'@tonconnect/ui': minor
'@tonconnect/ui-react': minor
---

UI error classes keep their names in minified bundles, and a wallet that rejects an injected request with a known error code now reaches the dApp as a typed SDK error such as `UserRejectsError` instead of `TonConnectUIError: Unhandled error`.

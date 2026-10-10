---
'@tonconnect/ui': minor
'@tonconnect/ui-react': minor
---

UI error classes report their class name in `error.name`, where it used to be `"Error"`, and keep it in minified bundles, and a wallet that rejects an injected request with a known error code now reaches the dApp as a typed SDK error such as `UserRejectsError` instead of `TonConnectUIError: Unhandled error`.

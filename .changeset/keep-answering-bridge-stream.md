---
'@tonconnect/sdk': patch
---

Keep the bridge stream of a wallet that answers a pending connection through a bridge that failed to
connect at first. If the wallet answered while a retry of the failed attempt was still scheduled,
that retry closed the stream the SDK had just chosen for the connection and nothing reopened it:
`connected` stayed `true` while events and responses from the wallet stopped reaching the dApp.

---
'@tonconnect/sdk': patch
---

Accept a `ton_proof` reply whose `proof` object has fields beyond the four the SDK reads. Such a
reply was replaced by an error, so a wallet that adds a field connected with no proof although the
fields it signed were all there. The SDK copies only `timestamp`, `domain`, `payload` and
`signature`, so an extra field still does not reach the dApp.

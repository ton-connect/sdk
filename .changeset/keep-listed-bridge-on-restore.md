---
'@tonconnect/sdk': patch
---

Keep a restored session on its bridge while the wallets list still advertises that bridge. On
restore the SDK looked the wallet up by the `device.appName` it reported and moved the session to
that list entry's bridge. Telegram's wallet reports `gramwallet`, so after a Mini App was reopened
its session was moved to Gram Wallet's bridge and requests such as `sendTransaction` never reached
the wallet. The SDK now moves a session only once its bridge is gone from the list, which is when the
wallet has migrated. A session that was already moved stays on the wrong bridge: the user has to
disconnect and connect the wallet again.

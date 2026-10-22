---
'@tonconnect/sdk': patch
---

Keep a restored HTTP connection on the bridge of the wallet the user picked. The SDK used to look
the wallet up by the `device.appName` it reports, so a wallet reporting another list entry's
`app_name` was moved to that entry's bridge on every restore and stopped receiving requests. The
picked wallet's `app_name` is now stored at connect time and used instead; connections stored by
older versions still fall back to `device.appName`.

---
'@tonconnect/sdk': patch
---

Move a restored HTTP connection to the new bridge of the wallet the user picked when that wallet
migrates. The SDK found the wallet by the `device.appName` it reports, which can name another list
entry, and then moved the session to that entry's bridge. The picked wallet's `app_name` is now
stored at connect time and used instead; connections stored by older versions still fall back to
`device.appName`.

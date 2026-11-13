---
'@tonconnect/sdk': patch
---

Move a restored HTTP connection to the new bridge of the wallet the user picked, also when that
wallet leaves a bridge other wallets still use. The picked wallet's `app_name` is now stored at
connect time and used instead of the self-reported `device.appName`, which can name another list
entry. Connections stored by older versions keep their bridge while the wallets list still
advertises it.

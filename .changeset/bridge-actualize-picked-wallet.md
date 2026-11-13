---
'@tonconnect/sdk': patch
---

Move a restored HTTP connection to the new bridge of the wallet it was connected through, also when
that wallet leaves a bridge other wallets still use. At connect time the SDK records the
wallets-list entry on the session's bridge that the wallet reports itself as, else the one the user
picked, else the only entry on that bridge. Connections without a recorded entry, including those
stored by older versions, keep their bridge while the wallets list still advertises it.

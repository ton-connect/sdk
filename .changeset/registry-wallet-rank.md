---
'@tonconnect/sdk': minor
'@tonconnect/ui': minor
---

`WalletInfo` gains an optional `rank` field from the wallets registry, and the wallets modal places
wallets by it in the mobile wallets row, the desktop "Available wallets" list, the "View all
wallets" tile and the All Wallets screen, shuffling the wallets that share a rank each time it
opens. The "View all wallets" tile now previews the supported wallets ahead of the others, as All
Wallets lists them.

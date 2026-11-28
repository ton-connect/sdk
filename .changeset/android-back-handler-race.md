---
'@tonconnect/ui': patch
---

Fix Android back handler popping the wrong history entry when modals are chained in the same tick (e.g. wallets-modal close → action-modal open), which caused embedded sendTransaction to abort with "Transaction was not sent" right after the user connected

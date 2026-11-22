---
'@tonconnect/ui': patch
---

Keep the action modal open while a request waits for the wallet. A click outside it or a press of
the Android back button used to close it, which aborted the request while the wallet went on showing
it: the dApp got "Transaction was not sent", and an approval after that still sent the transaction,
or for `signData` and `signMessage` reached nobody. The close button and Escape still close the
modal and abort the request, and the result modals close as before.

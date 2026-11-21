---
'@tonconnect/sdk': patch
---

Stop waiting for unreachable bridges when a pending connection is restored. A connection that was
started but not completed, for example by opening the wallets modal on desktop and closing it, is
restored on every page load for 5 minutes, and the restore waited until all of its bridges but
three had opened. A bridge that could not be reached was never counted, so with more than three
such bridges in the wallets list `restoreConnection()` only returned at its 12-second deadline,
and `connectionRestored` in `@tonconnect/ui` and `useIsConnectionRestored()` in
`@tonconnect/ui-react` stayed unresolved for that long. A bridge is now waited for until it opens
or a connection attempt to it ends in an error. It is still retried every 2 seconds in the
background, so a wallet that answers through it later still connects. A bridge that stays silent,
with neither an answer nor an error, is waited for as before.

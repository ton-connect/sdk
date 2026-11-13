---
'@tonconnect/sdk': patch
---

Reconnect the bridge event stream after it drops. When an open SSE stream was cut, for example by a
bridge instance restarting, the SDK cancelled the browser's own reconnect and opened no new stream,
so wallet responses stopped reaching the dApp until the tab was hidden and shown again or the page
was reloaded. The SDK now reopens the stream after 2 seconds from the last received event id. A
connection attempt that misses its opening deadline is now closed at the deadline instead of staying
open and recording the ids of messages it drops, and a reconnect attempt that misses it is retried
after 2 seconds. Such an attempt now rejects with a `TimeoutError` rather than an abort error.

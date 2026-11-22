---
'@tonconnect/sdk': patch
---

Stop a connection that is closed right after being resumed from reopening its bridge streams. When a
connection was paused, resumed and then closed before the resume took effect, the pending resume
still opened the streams of the closed connection, and some of them stayed open with nothing
listening to them.

---
'@tonconnect/ui': patch
---

A screen of the modal that is fading out after being replaced, and the modal itself while it closes,
can no longer be focused, pressed from the keyboard or reached by screen readers. They kept their
controls for the length of the fade, so a second Enter could press a wallet tile that had already
been replaced.

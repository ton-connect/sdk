---
'@tonconnect/ui': patch
---

fix: save init params in session storage to prevent invalid params after location change or reload

Fixes issue where init params become invalid after page reload or location change by persisting them in session storage.

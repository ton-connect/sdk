---
'@tonconnect/sdk': patch
---

Fix error class names being unreadable in minified production builds. `TonConnectError` and its subclasses built their message from `this.constructor.name`, which bundlers rename to a single letter — so logs showed `[TON_CONNECT_SDK_ERROR] A` instead of the real class name (#460). Each error now carries a stable, minification-safe `name` (a string literal) that is surfaced in the message.

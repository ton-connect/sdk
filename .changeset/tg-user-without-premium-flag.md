---
'@tonconnect/ui': patch
---

Report the Telegram user for non-premium accounts. `getTgUser` required `is_premium` to be a boolean, but Telegram omits the field unless the user has Premium, so every other user was reported as absent.

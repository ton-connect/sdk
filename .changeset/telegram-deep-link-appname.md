---
'@tonconnect/ui': patch
---

Stop sending `appname=undefined` in the Telegram deep link for a wallet whose `universal_url` has no app segment, such as `https://t.me/sendgrams`. The link now reads `tg://resolve?domain=sendgrams&startapp=...`.

---
'@tonconnect/sdk': minor
'@tonconnect/ui': minor
---

Analytics record how the user picks a wallet. `wallet-preselected`, `wallet-selected`, `connection-initiated` and `connection-link-generated` are sent at the moment of the action and carry the selection surface, the selection source and the kind of connection source, and `connection-completed` carries `is_restore`. The existing `connection-selected-wallet` event is unchanged.

Telegram Mini App detection moves from `@tonconnect/ui` into `@tonconnect/sdk` and is exported (`isInTMA`, `isInTelegramBrowser`, `isTmaPlatform`, `getTmaPlatform`, `getTmaWebAppVersion`, `getTgUser`), so a dApp on the bare SDK reports `client_environment` too. `connect()` accepts `linkDisplayOnly` for a link built only to be shown, and `analytics.url` sets the analytics endpoint.

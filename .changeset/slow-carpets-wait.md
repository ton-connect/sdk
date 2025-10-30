---
'@tonconnect/sdk': minor
'@tonconnect/ui': minor
'@tonconnect/ui-react': minor
---

feat: add comprehensive analytics tracking system

- added tracking for all major TON Connect interactions including connection lifecycle (connection-started, connection-selected-wallet, connection-completed, connection-error), disconnection, transactions (transaction-sent, transaction-signed, transaction-signing-failed), sign data requests, bridge client events (bridge-client-connect-started, bridge-client-connect-established, bridge-client-connect-error, bridge-client-message-sent, bridge-client-message-received, bridge-client-message-decode-error), and JS Bridge events (js-bridge-call, js-bridge-response, js-bridge-error)

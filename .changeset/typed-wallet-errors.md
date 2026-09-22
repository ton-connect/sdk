---
'@tonconnect/sdk': minor
---

Wallet errors are easier to handle and to read in production.

Error classes keep their names in minified bundles: `error.name` and the name in `error.message` come from a static `errorName` on each class instead of the runtime class name, so a dApp no longer sees mangled names like `e` or `Kf`. `name` is now a non-enumerable own property on every SDK error, including `WalletWrongNetworkError`, where it used to be enumerable.

Errors built from a wallet response carry the wallet's own error in `walletError` (`code`, `message`, `data` and the response id). Wallet code 400 maps to the new `MethodNotSupportedError` instead of `UnknownError`.

When an injected wallet rejects a request instead of returning a TON Connect error response, a known wallet error code in the rejection (for example `new Error(300)`) is read as that error, so `sendTransaction` throws `UserRejectsError` and `walletError.normalized` is set. Any other rejection, a failure to send the request at all, and an answer that is neither a TON Connect response (an object with `result`, or with an `error` whose `code` is an integer) nor, for `connect`, a well-formed `connect` or `connect_error` event becomes the new `WalletTransportError` with the original value in `cause`; `sendTransaction` and `signData` report it as a signing failure. A `connect` event counts as well-formed when every item has a name, `ton_addr` carries its account fields and `device` is a complete `DeviceInfo`. A malformed `connect` or `connect_error` event that an injected wallet sends on its own is reported the same way, as a failed connection. An injected `disconnect()` now always settles.

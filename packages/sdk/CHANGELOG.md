# Changelog @tonconnect/sdk 

# [2.1.0](https://github.com/ton-connect/sdk/compare/sdk-2.0.7...sdk-2.1.0) (2023-03-17)


### Bug Fixes

* **sdk:** `Features` format changed ([15341eb](https://github.com/ton-connect/sdk/commit/15341eb99c01c69c75a3070ab9b13188c77b78be))
* **sdk:** `from` and `network` properties added to the `SendTransactionRequest` ([2e1af4d](https://github.com/ton-connect/sdk/commit/2e1af4d278ea128e6c0437d429e9c2cc97747bf9))
* **sdk:** `pauseConnection` and `unPauseConnection`  methods added. Connection automatically pauses and unpauses on `window` `blur` and `focus`. ([7ee7ce3](https://github.com/ton-connect/sdk/commit/7ee7ce3351b1943123353bab950a91108fb98cbd))
* **sdk:** `publicKey` added to the `Account` ([74b25c7](https://github.com/ton-connect/sdk/commit/74b25c7f3acd892214287907c80915d88c548768))
* **sdk:** backward compatibility fixed. `WalletInfoInjected` marked as deprecated ([b567640](https://github.com/ton-connect/sdk/commit/b5676403a7c8e980c1e5bd24c5e9afa93c876d75))
* **sdk:** building process refactored. ES module output fixes ([490378b](https://github.com/ton-connect/sdk/commit/490378be5db130970a8a066440ca2d1df74606af))
* **sdk:** disconnect rpc call added ([c036602](https://github.com/ton-connect/sdk/commit/c0366026b16156d69596a84771a1f0d669bda746))
* **sdk:** disconnect rpc request call added ([a079b8a](https://github.com/ton-connect/sdk/commit/a079b8a5870136b19be65b33361b812edc92719f))
* **sdk:** disconnect rpc request fixes ([dd7d006](https://github.com/ton-connect/sdk/commit/dd7d0068faff517f5dd9fe9858b39b10a360f93a))
* **sdk:** errors description added ([73bbb6e](https://github.com/ton-connect/sdk/commit/73bbb6ef4590ba10661a2f1e26f97201ba571892))
* **sdk:** event id local storage bugs fixes ([068c3dc](https://github.com/ton-connect/sdk/commit/068c3dc13e5923c174a86099f6e26abec6154810))
* **sdk:** http-bridge fixes: ([d91f1f3](https://github.com/ton-connect/sdk/commit/d91f1f3d3231dc0b87386b413e8b9e50f3d4ae26))
* **sdk:** injected wallet metadata merged with wallets-list metadata ([7224b8e](https://github.com/ton-connect/sdk/commit/7224b8ecddf60e68137a57ef435a130e499f776f))
* **sdk:** internal event id added ([cd0d463](https://github.com/ton-connect/sdk/commit/cd0d4631d54f9fbcbc5b26d48752bd221a8b1e30))
* **sdk:** isWalletInfoInjected changed. isWalletInfoEmbedded, isWalletInfoInjectable, ([6c5899d](https://github.com/ton-connect/sdk/commit/6c5899d30cfed92c2fe24e2832a120c1b3e50821))
* **sdk:** README updated ([9210127](https://github.com/ton-connect/sdk/commit/921012740963410d106d5b04d8309b9c30f8b2f4))
* **sdk:** requests id conflicts fixes. Types fixes: `isWalletInfoCurrentlyInjected`, `isWalletInfoCurrentlyEmbedded` added ([eb50c26](https://github.com/ton-connect/sdk/commit/eb50c26b72a4bc91ad921dac3a7686431353b36f))
* **sdk:** rpc request id stores in the localstorage ([2d2916b](https://github.com/ton-connect/sdk/commit/2d2916b44f5c59608b925188116884171bf61b06))
* **sdk:** topic parameter added to the bridge request ([7f134b9](https://github.com/ton-connect/sdk/commit/7f134b982e5540775b4401a5254e38f45b56c6b8))
* **sdk:** wallets list source changed ([2a8ce70](https://github.com/ton-connect/sdk/commit/2a8ce700144039ba1ae4bae315363f819cdbccf2))


### Features

* **sdk:** universal connection method added ([db62787](https://github.com/ton-connect/sdk/commit/db62787d3035238d8944e866b5671ccec6be6c37))

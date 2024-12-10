# Changelog @tonconnect/sdk 

## [3.0.6-beta.0](https://github.com/ton-connect/sdk/compare/sdk-3.0.5...sdk-3.0.6-beta.0) (2024-12-10)


### Features

* **sdk:** update fallback wallets list configuration ([283e5bf](https://github.com/ton-connect/sdk/commit/283e5bf3cf7f073bcee1bc868c321cc6fc55b500))



## [3.0.5](https://github.com/ton-connect/sdk/compare/sdk-3.0.4...sdk-3.0.5) (2024-08-09)


### Features

* **sdk:** update fallback wallets list ([ec3fdd3](https://github.com/ton-connect/sdk/commit/ec3fdd30f1583951461737c21c45153b866925d8))



## [3.0.4](https://github.com/ton-connect/sdk/compare/sdk-3.0.4-beta.2...sdk-3.0.4) (2024-08-09)



## [3.0.4-beta.2](https://github.com/ton-connect/sdk/compare/sdk-3.0.4-beta.1...sdk-3.0.4-beta.2) (2024-07-31)


### Bug Fixes

* **sdk:** remove redundant `connectionEstablished` parameter ([dce8a6b](https://github.com/ton-connect/sdk/commit/dce8a6b8100dcdefe993028cee75b7d39a844238))



## [3.0.4-beta.1](https://github.com/ton-connect/sdk/compare/sdk-3.0.4-beta.0...sdk-3.0.4-beta.1) (2024-07-31)


### Bug Fixes

* **sdk:** fine-tune timeouts and enhance error handling for bridge reconnection ([6538103](https://github.com/ton-connect/sdk/commit/6538103f85b80b3091a6284c5cb5bf4cd155e68a))



## [3.0.4-beta.0](https://github.com/ton-connect/sdk/compare/sdk-3.0.3...sdk-3.0.4-beta.0) (2024-07-31)


### Bug Fixes

* **sdk:** ensure reconnection to bridge during prolonged handshake interruptions ([6ff4761](https://github.com/ton-connect/sdk/commit/6ff4761431c91511e8430abee537ba353eecd950))



## [3.0.3](https://github.com/ton-connect/sdk/compare/sdk-3.0.3-beta.1...sdk-3.0.3) (2024-05-28)



## [3.0.3-beta.1](https://github.com/ton-connect/sdk/compare/sdk-3.0.3-beta.0...sdk-3.0.3-beta.1) (2024-05-27)


### Features

* **sdk:** enhanced event tracking and version management ([cfc013d](https://github.com/ton-connect/sdk/commit/cfc013d6a6683352c95dfd5b48e5b005162c8ea5))



## [3.0.3-beta.0](https://github.com/ton-connect/sdk/compare/sdk-3.0.2...sdk-3.0.3-beta.0) (2024-05-20)


### Features

* **sdk:** integrate user action tracking ([e831385](https://github.com/ton-connect/sdk/commit/e831385e3ba8df40c86b18572713cabbb57e4ba4))



## [3.0.2](https://github.com/ton-connect/sdk/compare/sdk-3.0.2-beta.0...sdk-3.0.2) (2024-04-22)



## [3.0.2-beta.0](https://github.com/ton-connect/sdk/compare/sdk-3.0.1...sdk-3.0.2-beta.0) (2024-04-22)


### Bug Fixes

* **sdk:** ensures pausing the connection then attempts to unpause it ([346b13b](https://github.com/ton-connect/sdk/commit/346b13b303fbefe2cccab8851a8515469084872c))



## [3.0.1](https://github.com/ton-connect/sdk/compare/sdk-3.0.1-beta.2...sdk-3.0.1) (2024-04-22)



## [3.0.1-beta.2](https://github.com/ton-connect/sdk/compare/sdk-3.0.1-beta.1...sdk-3.0.1-beta.2) (2024-04-20)


### Bug Fixes

* **sdk:** ensure promise resolution when event source is recreated ([348ab1d](https://github.com/ton-connect/sdk/commit/348ab1d78e8f7253ded6463c5b52e748633f5948))



## [3.0.1-beta.1](https://github.com/ton-connect/sdk/compare/sdk-3.0.1-beta.0...sdk-3.0.1-beta.1) (2024-04-18)


### Bug Fixes

* **sdk:** enhance gateway management for efficient closure ([70f24f9](https://github.com/ton-connect/sdk/commit/70f24f98e0ce447928edf8bf6a738a88d6c833ee))
* **sdk:** remove sessions immediately if no bridge connection ([71f287c](https://github.com/ton-connect/sdk/commit/71f287c7328b4892ff80647638dfe0386cd43d2d))



## [3.0.1-beta.0](https://github.com/ton-connect/sdk/compare/sdk-3.0.0...sdk-3.0.1-beta.0) (2024-04-12)


### Bug Fixes

* **sdk:** checks if the signal is already aborted ([fa18cb2](https://github.com/ton-connect/sdk/commit/fa18cb21e2ea542e5045f74af8b601086730628e))
* **sdk:** ensure closure of previously opened gateway ([d4d1d50](https://github.com/ton-connect/sdk/commit/d4d1d50c8fe16fbe2624c2663cacea350974903c))
* **sdk:** ensuring the disconnect is called only if the provider is defined ([9b2bd71](https://github.com/ton-connect/sdk/commit/9b2bd7124477d21053e0159ace82202e311dfc1a))
* **sdk:** improve abort handling in connection and send methods ([dd87b04](https://github.com/ton-connect/sdk/commit/dd87b04e31614df01e6209a618b186c8b3d78d55))
* **sdk:** improve error handling in bridge gateway ([ea2aa79](https://github.com/ton-connect/sdk/commit/ea2aa79ffa0f80a755a762fae2090729ac7c8606))


### Features

* **sdk:** update fallback wallets list ([de9520d](https://github.com/ton-connect/sdk/commit/de9520df606beb55e56d1f6af6bfec729c163530))



# [3.0.0](https://github.com/ton-connect/sdk/compare/sdk-3.0.0-beta.6...sdk-3.0.0) (2023-12-26)



# [3.0.0-beta.6](https://github.com/ton-connect/sdk/compare/sdk-3.0.0-beta.5...sdk-3.0.0-beta.6) (2023-12-19)


### Bug Fixes

* **sdk:** added tonkeeper deeplink to the fallback wallets list ([6aa3ec4](https://github.com/ton-connect/sdk/commit/6aa3ec46283d9e962f8be7e28c2ab6529828a1f2))
* **sdk:** tonkeeper desktop platform added ([c9b1bcd](https://github.com/ton-connect/sdk/commit/c9b1bcddc71a29926368ce2079fb7c4b602d27f6))



# [3.0.0-beta.5](https://github.com/ton-connect/sdk/compare/sdk-3.0.0-beta.4...sdk-3.0.0-beta.5) (2023-12-02)


### Bug Fixes

* **sdk:** added waiting for bridge response before calling onRequestSent ([cf85057](https://github.com/ton-connect/sdk/commit/cf850572feef8d9720aba062fd6b1d76037ceb93))



# [3.0.0-beta.4](https://github.com/ton-connect/sdk/compare/sdk-3.0.0-beta.3...sdk-3.0.0-beta.4) (2023-12-01)


### Bug Fixes

* **sdk:** throw TonConnectError for non-2xx bridge responses ([97710a6](https://github.com/ton-connect/sdk/commit/97710a6d38e347c13799c9973f26ec10d48337f4))


### Features

* **sdk:** add onRequestSent callback to sendTransaction ([86f6bed](https://github.com/ton-connect/sdk/commit/86f6bed7dc03c7c156862cccdad1218cef5b33c9))
* **sdk:** migrate Telegram links to direct links ([0d975d1](https://github.com/ton-connect/sdk/commit/0d975d1bfe0a5ffb6996f8c4dc31cf0cf90aa5f7))



# [3.0.0-beta.3](https://github.com/ton-connect/sdk/compare/sdk-3.0.0-beta.2...sdk-3.0.0-beta.3) (2023-11-06)



# [3.0.0-beta.2](https://github.com/ton-connect/sdk/compare/sdk-3.0.0-beta.1...sdk-3.0.0-beta.2) (2023-11-02)


### Bug Fixes

* **sdk:** mock localStorage in Safari private mode ([0d30b83](https://github.com/ton-connect/sdk/commit/0d30b8399a188de6ae9dc9dbd952639a761d3c06)), closes [#93](https://github.com/ton-connect/sdk/issues/93)


### Features

* **sdk:** change address format from bounceable to no-bounceable ([a000d6e](https://github.com/ton-connect/sdk/commit/a000d6ed6974babdbb335b47e0221c852890cb26))



# [3.0.0-beta.1](https://github.com/ton-connect/sdk/compare/sdk-3.0.0-beta.0...sdk-3.0.0-beta.1) (2023-09-12)


### Bug Fixes

* **sdk:** bridge unavailability handled, max timeout added ([c0056d5](https://github.com/ton-connect/sdk/commit/c0056d5df16c15fc17bdd6e6bf119ff6c8cd60dc))



# [3.0.0-beta.0](https://github.com/ton-connect/sdk/compare/sdk-2.2.0...sdk-3.0.0-beta.0) (2023-09-08)


### Bug Fixes

* **sdk:** storing pending connection ([260653c](https://github.com/ton-connect/sdk/commit/260653c4ccb9acef09d1c983a1207d5957b6de80))
* **sdk:** telegram parameters encoding function exported ([95fc07b](https://github.com/ton-connect/sdk/commit/95fc07b399d808ab99b07804ecf7bbc9963730f8))


### Features

* **sdk:** new wallets-list source added ([07f25de](https://github.com/ton-connect/sdk/commit/07f25de8910d8efb9d972a2f64c4375aaf579c99))



# [2.2.0](https://github.com/ton-connect/sdk/compare/sdk-2.1.4...sdk-2.2.0) (2023-08-18)


### Bug Fixes

* **sdk:** `app_name` added to WalletInfo ([a0fa12e](https://github.com/ton-connect/sdk/commit/a0fa12ebb976f385a3f870a3b551fb74fc591136))


### Features

* **sdk:** [@wallet](https://github.com/wallet) universal links supported ([05f7000](https://github.com/ton-connect/sdk/commit/05f70005523808694bcb985584f49b6eb039b1b3))



## [2.1.4](https://github.com/ton-connect/sdk/compare/sdk-2.1.3...sdk-2.1.4) (2023-08-15)


### Bug Fixes

* 'platform' field added to WalletInfo ([40e0332](https://github.com/ton-connect/sdk/commit/40e0332a37886baef6aaa9942a8fad7a2e29d78b))
* **sdk:** README updated ([900c115](https://github.com/ton-connect/sdk/commit/900c115bd71aa631026f60e55632e03d7b185784))



## [2.1.3](https://github.com/ton-connect/sdk/compare/sdk-2.1.2...sdk-2.1.3) (2023-04-03)


### Bug Fixes

* **sdk:** wallets list cache option added. `WalletsListManager` exported ([52fe8f6](https://github.com/ton-connect/sdk/commit/52fe8f6ecd8890b05382520b91587877cae882ae))



## [2.1.2](https://github.com/ton-connect/sdk/compare/sdk-2.1.1...sdk-2.1.2) (2023-03-22)


### Bug Fixes

* **sdk:** wallets list fallback added ([518c87b](https://github.com/ton-connect/sdk/commit/518c87b9c5a5f9c41626ba352414e0392d28d681))
* **sdk:** wallets list tests added ([f8784fc](https://github.com/ton-connect/sdk/commit/f8784fc8971053490098d6946b6fead964f1ad85))



## [2.1.1](https://github.com/ton-connect/sdk/compare/sdk-2.1.0...sdk-2.1.1) (2023-03-22)


### Bug Fixes

* **sdk:** extension was disabled after wallet connection check added ([b13d1e1](https://github.com/ton-connect/sdk/commit/b13d1e15428b1f05ab71d3f2412e94e3f4f12415))
* **sdk:** fetch wallets list error when window contains iframe fixed ([b1f338a](https://github.com/ton-connect/sdk/commit/b1f338a34159b7c3251271a38a3579cc6b7a2a84))
* **sdk:** option to disable auto pause/unpause SSE connection on 'document.visibilitychange' event added ([5b1aeff](https://github.com/ton-connect/sdk/commit/5b1aeff0827722d84c7a675046b9484a222a7e7e))



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

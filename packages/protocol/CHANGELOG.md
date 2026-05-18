# Changelog @tonconnect/protocol

## 3.0.0-beta.2

### Major Changes

- TON Connect V3 — sign message, embedded requests, structure items.

## 2.5.0-alpha.1

### Minor Changes

- 73907ad: Add embedded requests

    An RPC request (`sendTransaction`, `signMessage`, or `signData`) can now be embedded directly
    into the connect URL via an `e` query parameter. On mobile this lets the wallet handle
    connection and action in a single tap, eliminating the round-trip for "connect and pay" flows.

    In the UI SDK, pass `enableEmbeddedRequest: true` in the request options to opt in. With the
    flag, the result is always wrapped in an `EmbeddedTResponse` envelope:
    - `{ hasResponse: true, response }` — the request was completed, either folded into connect by
      an embedded-request-capable wallet, or via the normal bridge flow when the wallet was already
      connected.
    - `{ hasResponse: false, connectResult: { dispatched } }` — the wallet connected but did not
      return a signed result. Two sub-cases:
        - `dispatched: false` — the request never reached the wallet;
        - `dispatched: true` — the request was delivered to the wallet inside the connect URL, but
          no response came back. **The wallet may have already processed it.** dApps MUST NOT retry
          silently in this case — surface an explicit retry button to the user and, where
          applicable, verify on-chain state (e.g. recipient's recent transaction history) before
          re-submitting to avoid duplicate transactions or signatures.

    Wallets declare support via the `EmbeddedRequest` feature in `DeviceInfo.features`.

## 2.5.0-alpha.0

### Minor Changes

- 73907ad: Add embedded requests

    An RPC request (`sendTransaction`, `signMessage`, or `signData`) can now be embedded directly
    into the connect URL via an `e` query parameter. On mobile this lets the wallet handle
    connection and action in a single tap, eliminating the round-trip for "connect and pay" flows.

    In the UI SDK, pass `onConnected` in the request options — the SDK opens the wallet modal,
    includes the embedded request in the connect URL, and resolves either from the connect event (if
    the wallet supports `EmbeddedRequest`) or by falling back to the standard bridge flow. The
    callback receives `context.dispatched` so the dApp can verify on-chain state before retrying, to
    avoid duplicate submissions on a network error.

    Wallets declare support via the `EmbeddedRequest` feature in `DeviceInfo.features`.

- a9021e6: Add `signMessage` method

    Wallets can now be asked to sign an internal message without broadcasting it. The signed BoC is
    returned to the dApp, which can submit it through a relayer — enabling gasless (sponsored)
    transaction flows where the user does not need to hold TON for gas.

    The request payload has the same shape as `sendTransaction` (supports both raw `messages` and
    structured `items`). Wallets declare support via the `SignMessage` feature in
    `DeviceInfo.features`.

- 609418a: Add structured items to `sendTransaction` and `signMessage`

    A new `items` field is accepted as an alternative to `messages`. Instead of constructing raw BoC
    payloads, dApps describe transfers at a high level and the wallet handles BoC construction —
    resolving jetton wallet addresses, building transfer cells, and estimating gas.

    Three item types are supported: `ton`, `jetton`, and `nft`. A request must contain either
    `messages` or `items`, never both. Wallets declare supported item types via the `itemTypes`
    field in the `SendTransaction` / `SignMessage` feature entries.

## 2.4.0

### Minor Changes

- afcdd9b: feat: add network selection support for wallet connections
    - Added `ChainId` type in `@tonconnect/protocol` to support arbitrary network identifiers
      (extends `CHAIN` enum with string)
    - Added `setConnectionNetwork()` method in SDK and UI to specify desired network before
      connecting
    - Added `network` field to `TonAddressItem` in connect requests to inform wallet about desired
      network
    - Added `WalletWrongNetworkError` that is thrown when wallet connects to a different network
      than expected
    - Network validation is performed on connect, `sendTransaction`, and `signData` operations
    - UI modals now display user-friendly error messages when network mismatch occurs

    **Usage:**

    ```typescript
    import { CHAIN } from '@tonconnect/ui';

    // Set desired network before connecting
    tonConnectUI.setConnectionNetwork(CHAIN.MAINNET); // or CHAIN.TESTNET, or any custom chainId string

    // Allow any network (default behavior)
    tonConnectUI.setConnectionNetwork(undefined);
    ```

## 2.4.0-beta.0

### Minor Changes

- afcdd9b: feat: add network selection support for wallet connections
    - Added `ChainId` type in `@tonconnect/protocol` to support arbitrary network identifiers
      (extends `CHAIN` enum with string)
    - Added `setConnectionNetwork()` method in SDK and UI to specify desired network before
      connecting
    - Added `network` field to `TonAddressItem` in connect requests to inform wallet about desired
      network
    - Added `WalletWrongNetworkError` that is thrown when wallet connects to a different network
      than expected
    - Network validation is performed on connect, `sendTransaction`, and `signData` operations
    - UI modals now display user-friendly error messages when network mismatch occurs

    **Usage:**

    ```typescript
    import { CHAIN } from '@tonconnect/ui';

    // Set desired network before connecting
    tonConnectUI.setConnectionNetwork(CHAIN.MAINNET); // or CHAIN.TESTNET, or any custom chainId string

    // Allow any network (default behavior)
    tonConnectUI.setConnectionNetwork(undefined);
    ```

# [2.3.0](https://github.com/ton-connect/sdk/compare/protocol-2.3.0-beta.0...protocol-2.3.0) (2025-06-25)

### Features

- **protocol:** add network and from fields support to signData
  ([df3ce43](https://github.com/ton-connect/sdk/commit/df3ce43c2162201de4ccddf1ede2cd00d59e4eff))

# [2.3.0-beta.0](https://github.com/ton-connect/sdk/compare/protocol-2.2.7...protocol-2.3.0-beta.0) (2025-05-08)

### Features

- **protocol:** add FeatureName type
  ([997f49c](https://github.com/ton-connect/sdk/commit/997f49ceb97586626107068ea96adc41eae53240))
- **protocol:** implement SignData feature
  ([0b64e1c](https://github.com/ton-connect/sdk/commit/0b64e1cf57bfd6dbd86ebd98d6042748a9865421))

## [2.2.7](https://github.com/ton-connect/sdk/compare/protocol-2.2.7-alpha.1...protocol-2.2.7) (2025-03-06)

## [2.2.7-alpha.1](https://github.com/ton-connect/sdk/compare/protocol-2.2.7-alpha.0...protocol-2.2.7-alpha.1) (2025-02-18)

### Features

- **protocol:** rename `extraCurrenciesSupported` to `extraCurrencySupported`
  ([41b6984](https://github.com/ton-connect/sdk/commit/41b6984820b4485b514ef2c3be14b5d6d93774c3))

## [2.2.7-alpha.0](https://github.com/ton-connect/sdk/compare/protocol-2.2.6...protocol-2.2.7-alpha.0) (2025-02-17)

### Features

- **protocol:** add `extraCurrenciesSupported` flag to `SendTransaction` feature
  ([99a2e74](https://github.com/ton-connect/sdk/commit/99a2e74ec7315f72ce2abe450123ca9ea57a3414))

## [2.2.6](https://github.com/ton-connect/sdk/compare/protocol-2.2.6-beta.0...protocol-2.2.6) (2023-11-06)

## [2.2.6-beta.0](https://github.com/ton-connect/sdk/compare/protocol-2.2.5...protocol-2.2.6-beta.0) (2023-11-02)

## [2.2.5](https://github.com/ton-connect/sdk/compare/protocol-2.2.4...protocol-2.2.5) (2023-03-09)

### Bug Fixes

- **protocol:** `Features` format changed
  ([3bc5f68](https://github.com/ton-connect/sdk/commit/3bc5f689779807b8a78784484f48e849e83544f9))
- **protocol:** building process refactored
  ([2516523](https://github.com/ton-connect/sdk/commit/251652336964c6ab2b2dedb3ab0530f15de2c29b))

## [2.2.4](https://github.com/ton-connect/sdk/compare/protocol-2.2.3...protocol-2.2.4) (2023-03-01)

### Bug Fixes

- **protocol:** `publicKey` added to the `TonAddressItemReply`
  ([a0fd029](https://github.com/ton-connect/sdk/commit/a0fd029b8d7aff7aa540d551eef208b92b2666e1))

## [2.2.3](https://github.com/ton-connect/sdk/compare/protocol-2.2.2...protocol-2.2.3) (2023-02-23)

### Bug Fixes

- **protocol:** webcrypto.getRandomValues replaced with nacl.randomBytes
  ([779352a](https://github.com/ton-connect/sdk/commit/779352ae3eb6628eea37ce3f7f4379abd08cff67))

## [2.2.2](https://github.com/ton-connect/sdk/compare/protocol-2.2.1...protocol-2.2.2) (2023-02-09)

### Bug Fixes

- **protocol:** added id for events
  ([e9e2123](https://github.com/ton-connect/sdk/commit/e9e2123da11ac074a9fe557f2cae18b3ac191e0e))

## [2.2.1](https://github.com/ton-connect/sdk/compare/protocol-2.2.0...protocol-2.2.1) (2023-02-09)

### Bug Fixes

- **protocol:** CONNECT_ITEM_ERROR_CODES reexport added
  ([9969635](https://github.com/ton-connect/sdk/commit/99696354aceb12537aaf7c1fefe9f3badf44c0fc))

# [2.2.0](https://github.com/ton-connect/sdk/compare/protocol-2.1.0...protocol-2.2.0) (2023-02-08)

### Features

- **protocol:** disconnect request added
  ([1ef8f41](https://github.com/ton-connect/sdk/commit/1ef8f4108526492edc1abd663d32dfb7f59a043c))

# [2.1.0](https://github.com/ton-connect/sdk/compare/protocol-2.0.1...protocol-2.1.0) (2023-01-31)

### Features

- **protocol:** sign data method added
  ([3f18446](https://github.com/ton-connect/sdk/commit/3f18446fd8712861ba8e51d447c5888b11b3c7e3))

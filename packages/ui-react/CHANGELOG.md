# Changelog @tonconnect/ui-react

## 3.0.0

### Major Changes

- d918578: TON Connect V3 — sign message, embedded requests, structure items.

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

### Patch Changes

- 97316b7: Fix border radius
- Updated dependencies [97316b7]
- Updated dependencies [73907ad]
- Updated dependencies [d918578]
- Updated dependencies [a9021e6]
- Updated dependencies [609418a]
    - @tonconnect/ui@3.0.0

## 3.0.0-beta.2

### Major Changes

- TON Connect V3 — sign message, embedded requests, structure items.

### Patch Changes

- Updated dependencies
    - @tonconnect/ui@3.0.0-beta.2

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

### Patch Changes

- Updated dependencies [73907ad]
    - @tonconnect/ui@2.5.0-alpha.1

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

### Patch Changes

- 97316b7: Fix border radius
- Updated dependencies [97316b7]
- Updated dependencies [73907ad]
- Updated dependencies [a9021e6]
- Updated dependencies [609418a]
    - @tonconnect/ui@2.5.0-alpha.0

## 2.4.4

### Patch Changes

- Updated dependencies [fb9f6ca]
    - @tonconnect/ui@2.4.4

## 2.4.3

### Patch Changes

- Updated dependencies [39fa11d]
    - @tonconnect/ui@2.4.3

## 2.4.2

### Patch Changes

- Updated dependencies [b9d0441]
    - @tonconnect/ui@2.4.2

## 2.4.1

### Patch Changes

- @tonconnect/ui@2.4.1

## 2.4.0

### Minor Changes

- 3964cf3: feat: add support for custom TonConnectUI instance in TonConnectUIProvider

    Added optional `tonConnectUI` prop to `TonConnectUIProvider` to allow passing a pre-initialized
    TonConnectUI instance. This enables:
    - Sharing a single instance between multiple parts of the application
    - Initializing with custom logic before passing it to the provider
    - Using the same instance across React and non-React parts of the application

    **Usage:**

    ```typescript
    import { TonConnectUIProvider } from '@tonconnect/ui-react';
    import { TonConnectUI } from '@tonconnect/ui';

    const tonConnectUI = new TonConnectUI({
      manifestUrl: 'https://myapp.com/tonconnect-manifest.json',
      // ... other options
    });

    function App() {
      return (
        <TonConnectUIProvider tonConnectUI={tonConnectUI}>
          {/* Your app */}
        </TonConnectUIProvider>
      );
    }
    ```

- 2cbf8a8: feat: add comprehensive analytics tracking system
    - added tracking for all major TON Connect interactions including connection lifecycle
      (connection-started, connection-selected-wallet, connection-completed, connection-error),
      disconnection, transactions (transaction-sent, transaction-signed,
      transaction-signing-failed), sign data requests, bridge client events
      (bridge-client-connect-started, bridge-client-connect-established,
      bridge-client-connect-error, bridge-client-message-sent, bridge-client-message-received,
      bridge-client-message-decode-error), and JS Bridge events (js-bridge-call, js-bridge-response,
      js-bridge-error)
    - analytics mode can be configured via `analytics` prop: **off** (disabled), **telemetry**
      (events for technical research, default), **full** (full analytics)

    **Usage (React):**

    ```tsx
    <TonConnectUIProvider
        manifestUrl="https://<YOUR_APP_URL>/tonconnect-manifest.json"
        analytics={{ mode: 'off' }}
    >
        {/* Your app */}
    </TonConnectUIProvider>
    ```

- 2cbf8a8: feat: add trace ID support for tracking user flows
    - added UUIDv7-based trace IDs to aggregate multiple events into a single user flow
    - trace IDs are automatically generated for all operations and added to links
    - trace IDs are propagated through the entire connection lifecycle and included in all analytics
      events
    - returned response objects now include `traceId` field for correlation with analytics data
    - `sendTransaction` method now accepts optional `traceId` parameter in options:

    ```typescript
    const result = await tonConnectUI.sendTransaction(
        {
            messages: [
                {
                    address: 'Ef9VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVbxn',
                    amount: '20000000'
                }
            ]
        },
        {
            traceId: '019a2a92-a884-7cfc-b1bc-caab18644b6f' // optional, auto-generated if not provided
        }
    );

    console.log(result.traceId); // returns trace ID for tracking
    ```

    - `signData` method now accepts optional `traceId` parameter in options:

    ```typescript
    const result = await tonConnectUI.signData(
        {
            type: 'text',
            text: 'Hello, TON!'
        },
        {
            traceId: '019a2a92-a884-7cfc-b1bc-caab18644b6f' // optional, auto-generated if not provided
        }
    );

    console.log(result.traceId); // returns trace ID for tracking
    ```

### Patch Changes

- Updated dependencies [3964cf3]
- Updated dependencies [7490f7e]
- Updated dependencies [3964cf3]
- Updated dependencies [afcdd9b]
- Updated dependencies [2cbf8a8]
- Updated dependencies [2cbf8a8]
- Updated dependencies [7493b12]
    - @tonconnect/ui@2.4.0

## 2.4.0-beta.7

### Patch Changes

- @tonconnect/ui@2.4.0-beta.7

## 2.4.0-beta.6

### Patch Changes

- Updated dependencies [3964cf3]
    - @tonconnect/ui@2.4.0-beta.6

## 2.4.0-beta.5

### Minor Changes

- 3964cf3: feat: add support for custom TonConnectUI instance in TonConnectUIProvider

    Added optional `tonConnectUI` prop to `TonConnectUIProvider` to allow passing a pre-initialized
    TonConnectUI instance. This enables:
    - Sharing a single instance between multiple parts of the application
    - Initializing with custom logic before passing it to the provider
    - Using the same instance across React and non-React parts of the application

    **Usage:**

    ```typescript
    import { TonConnectUIProvider } from '@tonconnect/ui-react';
    import { TonConnectUI } from '@tonconnect/ui';

    const tonConnectUI = new TonConnectUI({
      manifestUrl: 'https://myapp.com/tonconnect-manifest.json',
      // ... other options
    });

    function App() {
      return (
        <TonConnectUIProvider tonConnectUI={tonConnectUI}>
          {/* Your app */}
        </TonConnectUIProvider>
      );
    }
    ```

### Patch Changes

- Updated dependencies [3964cf3]
- Updated dependencies [3964cf3]
    - @tonconnect/ui@2.4.0-beta.5

## 2.4.0-beta.4

### Patch Changes

- Updated dependencies [7490f7e]
    - @tonconnect/ui@2.4.0-beta.4

## 2.4.0-beta.3

### Patch Changes

- @tonconnect/ui@2.4.0-beta.3

## 2.4.0-beta.2

### Patch Changes

- Updated dependencies [7493b12]
    - @tonconnect/ui@2.4.0-beta.2

## 2.4.0-beta.1

### Patch Changes

- Updated dependencies [afcdd9b]
    - @tonconnect/ui@2.4.0-beta.1

## 2.4.0-beta.0

### Minor Changes

- 2cbf8a8: feat: add comprehensive analytics tracking system
    - added tracking for all major TON Connect interactions including connection lifecycle
      (connection-started, connection-selected-wallet, connection-completed, connection-error),
      disconnection, transactions (transaction-sent, transaction-signed,
      transaction-signing-failed), sign data requests, bridge client events
      (bridge-client-connect-started, bridge-client-connect-established,
      bridge-client-connect-error, bridge-client-message-sent, bridge-client-message-received,
      bridge-client-message-decode-error), and JS Bridge events (js-bridge-call, js-bridge-response,
      js-bridge-error)
    - analytics mode can be configured via `analytics` prop: **off** (disabled), **telemetry**
      (events for technical research, default), **full** (full analytics)

    **Usage (React):**

    ```tsx
    <TonConnectUIProvider
        manifestUrl="https://<YOUR_APP_URL>/tonconnect-manifest.json"
        analytics={{ mode: 'off' }}
    >
        {/* Your app */}
    </TonConnectUIProvider>
    ```

- 2cbf8a8: feat: add trace ID support for tracking user flows
    - added UUIDv7-based trace IDs to aggregate multiple events into a single user flow
    - trace IDs are automatically generated for all operations and added to links
    - trace IDs are propagated through the entire connection lifecycle and included in all analytics
      events
    - returned response objects now include `traceId` field for correlation with analytics data
    - `sendTransaction` method now accepts optional `traceId` parameter in options:

    ```typescript
    const result = await tonConnectUI.sendTransaction(
        {
            messages: [
                {
                    address: 'Ef9VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVbxn',
                    amount: '20000000'
                }
            ]
        },
        {
            traceId: '019a2a92-a884-7cfc-b1bc-caab18644b6f' // optional, auto-generated if not provided
        }
    );

    console.log(result.traceId); // returns trace ID for tracking
    ```

    - `signData` method now accepts optional `traceId` parameter in options:

    ```typescript
    const result = await tonConnectUI.signData(
        {
            type: 'text',
            text: 'Hello, TON!'
        },
        {
            traceId: '019a2a92-a884-7cfc-b1bc-caab18644b6f' // optional, auto-generated if not provided
        }
    );

    console.log(result.traceId); // returns trace ID for tracking
    ```

### Patch Changes

- Updated dependencies [2cbf8a8]
- Updated dependencies [2cbf8a8]
    - @tonconnect/ui@2.4.0-beta.0

## 2.3.1

### Patch Changes

- f9735ee: chore: update fallback wallets list to match config.ton.org/wallets-v2.json
- 958e7b3: feat: add base64 normalization to support URL-safe base64 encoding
- 143ec17: feat: migrate wallet list URL to config.ton.org/wallets-v2.json
- Updated dependencies [f9735ee]
- Updated dependencies [958e7b3]
- Updated dependencies [143ec17]
    - @tonconnect/ui@2.3.1

## 2.3.1-beta.0

### Patch Changes

- f9735ee: chore: update fallback wallets list to match config.ton.org/wallets-v2.json
- 958e7b3: feat: add base64 normalization to support URL-safe base64 encoding
- 143ec17: feat: migrate wallet list URL to config.ton.org/wallets-v2.json
- Updated dependencies [f9735ee]
- Updated dependencies [958e7b3]
- Updated dependencies [143ec17]
    - @tonconnect/ui@2.3.1-beta.0

## 2.3.0

### Patch Changes

- c90140a: chore: update dependencies
- 4d80c1f: feat: add id support for links (per spec
  https://github.com/ton-blockchain/ton-connect/pull/90/files)
- 29f36e8: fix: links telegram format
- 4d80c1f: fix(ui): prevent enabling scroll if already enabled
- 4d80c1f: fix(sdk): do not cache injected wallets in wallets list manager
- 4d80c1f: fix(ui): reload wallets list when the modal opens
- 4d80c1f: BREAKING: strict request validation is now enforced

    **ton_proof**
    - `payload` size **≤ 128 bytes**
    - `domain` size **≤ 128 bytes**
    - (`payload` + `domain`) size **≤ 222 bytes**

    **sendTransaction (dApp → wallet)**
    - Request is validated against the
      [**Requests and Responses** specification](https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md)
    - Invalid requests now fail.

    **signData (dApp → wallet)**
    - Request is validated against the
      [**Requests and Responses** specification](https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md)
    - Invalid requests now fail.

    ### Migration
    - Keep `ton_proof` payload and `domain` within the limits above.
    - Ensure your **sendTransaction** object strictly follows the specification.
    - Ensure your **signData** request matches the specification.

    If your app previously sent oversized `ton_proof` data or non-conformant requests, update them
    to pass the new checks or they will be rejected.

- Updated dependencies [c90140a]
- Updated dependencies [4d80c1f]
- Updated dependencies [29f36e8]
- Updated dependencies [4d80c1f]
- Updated dependencies [4d80c1f]
- Updated dependencies [4d80c1f]
- Updated dependencies [4d80c1f]
    - @tonconnect/ui@2.3.0

## 2.3.0-beta.4

### Patch Changes

- fix: links telegram format
- Updated dependencies
    - @tonconnect/ui@2.3.0-beta.4

## 2.3.0-beta.3

### Patch Changes

- feat: add id support for links (per spec
  https://github.com/ton-blockchain/ton-connect/pull/90/files)
- fix(ui): prevent enabling scroll if already enabled
- fix(sdk): do not cache injected wallets in wallets list manager
- fix(ui): reload wallets list when the modal opens
- BREAKING: strict request validation is now enforced

    **ton_proof**
    - `payload` size **≤ 128 bytes**
    - `domain` size **≤ 128 bytes**
    - (`payload` + `domain`) size **≤ 222 bytes**

    **sendTransaction (dApp → wallet)**
    - Request is validated against the
      [**Requests and Responses** specification](https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md)
    - Invalid requests now fail.

    **signData (dApp → wallet)**
    - Request is validated against the
      [**Requests and Responses** specification](https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md)
    - Invalid requests now fail.

    ### Migration
    - Keep `ton_proof` payload and `domain` within the limits above.
    - Ensure your **sendTransaction** object strictly follows the specification.
    - Ensure your **signData** request matches the specification.

    If your app previously sent oversized `ton_proof` data or non-conformant requests, update them
    to pass the new checks or they will be rejected.

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
    - @tonconnect/ui@2.3.0-beta.3

## 2.3.0-beta.2

### Patch Changes

- chore: update dependencies
- Updated dependencies
    - @tonconnect/ui@2.3.0-beta.2

## 2.3.0-beta.1

### Patch Changes

- @tonconnect/ui@2.3.0-beta.1

# [2.3.0-beta.0](https://github.com/ton-connect/sdk/compare/ui-react-2.2.0...ui-react-2.3.0-beta.0) (2025-07-25)

# [2.2.0](https://github.com/ton-connect/sdk/compare/ui-react-2.2.0-beta.0...ui-react-2.2.0) (2025-06-25)

# [2.2.0-beta.0](https://github.com/ton-connect/sdk/compare/ui-react-2.1.1-beta.0...ui-react-2.2.0-beta.0) (2025-05-08)

### Features

- **ui-react:** add support for preferred wallet features in TonConnectUIProvider
  ([34ffde3](https://github.com/ton-connect/sdk/commit/34ffde335ecaba7d725d56732bd3b5ec3228e386))

## [2.1.1-beta.0](https://github.com/ton-connect/sdk/compare/ui-react-2.1.0...ui-react-2.1.1-beta.0) (2025-03-27)

# [2.1.0](https://github.com/ton-connect/sdk/compare/ui-react-2.0.13-beta.1...ui-react-2.1.0) (2025-03-24)

### Features

- **ui-react:** refactor wallet required features from array to object structure
  ([083af0c](https://github.com/ton-connect/sdk/commit/083af0c136acea37f08616c3a1ab71b208d95e2f))

## [2.0.13-beta.1](https://github.com/ton-connect/sdk/compare/ui-react-2.0.13-beta.0...ui-react-2.0.13-beta.1) (2025-03-18)

### Features

- **ui-react:** add support for required features
  ([d935402](https://github.com/ton-connect/sdk/commit/d935402b9d270ff20e59c1b45d7f9f558a4bb9ad))

## [2.0.13-beta.0](https://github.com/ton-connect/sdk/compare/ui-react-2.0.12...ui-react-2.0.13-beta.0) (2025-03-14)

### Features

- **ui-react:** add support for react 19 and preact while maintaining backward compatibility
  ([cf7cc52](https://github.com/ton-connect/sdk/commit/cf7cc52c853437965c4255074af54381cafffa43))

## [2.0.12](https://github.com/ton-connect/sdk/compare/ui-react-2.0.12-alpha.1...ui-react-2.0.12) (2025-03-06)

## [2.0.12-alpha.1](https://github.com/ton-connect/sdk/compare/ui-react-2.0.12-alpha.0...ui-react-2.0.12-alpha.1) (2025-02-18)

## [2.0.12-alpha.0](https://github.com/ton-connect/sdk/compare/ui-react-2.0.11...ui-react-2.0.12-alpha.0) (2025-02-17)

## [2.0.11](https://github.com/ton-connect/sdk/compare/ui-react-2.0.10...ui-react-2.0.11) (2025-01-13)

### Bug Fixes

- **ui-react:** update @tonconnect/ui dependency to 2.0.11
  ([9f26590](https://github.com/ton-connect/sdk/commit/9f26590b8e807f0be6d0b4d9ee8ef735bb54e892))

## [2.0.10](https://github.com/ton-connect/sdk/compare/ui-react-2.0.10-beta.3...ui-react-2.0.10) (2025-01-13)

## [2.0.10-beta.3](https://github.com/ton-connect/sdk/compare/ui-react-2.0.10-beta.2...ui-react-2.0.10-beta.3) (2024-12-10)

## [2.0.10-beta.2](https://github.com/ton-connect/sdk/compare/ui-react-2.0.10-beta.1...ui-react-2.0.10-beta.2) (2024-12-10)

## [2.0.10-beta.1](https://github.com/ton-connect/sdk/compare/ui-react-2.0.10-beta.0...ui-react-2.0.10-beta.1) (2024-11-16)

## [2.0.10-beta.0](https://github.com/ton-connect/sdk/compare/ui-react-2.0.9...ui-react-2.0.10-beta.0) (2024-08-15)

## [2.0.9](https://github.com/ton-connect/sdk/compare/ui-react-2.0.9-beta.3...ui-react-2.0.9) (2024-08-14)

## [2.0.9-beta.3](https://github.com/ton-connect/sdk/compare/ui-react-2.0.9-beta.2...ui-react-2.0.9-beta.3) (2024-08-14)

## [2.0.9-beta.2](https://github.com/ton-connect/sdk/compare/ui-react-2.0.9-beta.1...ui-react-2.0.9-beta.2) (2024-08-14)

## [2.0.9-beta.1](https://github.com/ton-connect/sdk/compare/ui-react-2.0.9-beta.0...ui-react-2.0.9-beta.1) (2024-08-14)

## [2.0.9-beta.0](https://github.com/ton-connect/sdk/compare/ui-react-2.0.8...ui-react-2.0.9-beta.0) (2024-08-09)

## [2.0.8](https://github.com/ton-connect/sdk/compare/ui-react-2.0.7...ui-react-2.0.8) (2024-08-09)

## [2.0.7](https://github.com/ton-connect/sdk/compare/ui-react-2.0.7-beta.2...ui-react-2.0.7) (2024-08-09)

## [2.0.7-beta.2](https://github.com/ton-connect/sdk/compare/ui-react-2.0.7-beta.1...ui-react-2.0.7-beta.2) (2024-07-31)

## [2.0.7-beta.1](https://github.com/ton-connect/sdk/compare/ui-react-2.0.7-beta.0...ui-react-2.0.7-beta.1) (2024-07-31)

## [2.0.7-beta.0](https://github.com/ton-connect/sdk/compare/ui-react-2.0.6...ui-react-2.0.7-beta.0) (2024-07-31)

## [2.0.6](https://github.com/ton-connect/sdk/compare/ui-react-2.0.5...ui-react-2.0.6) (2024-07-08)

## [2.0.5](https://github.com/ton-connect/sdk/compare/ui-react-2.0.4...ui-react-2.0.5) (2024-06-08)

## [2.0.4](https://github.com/ton-connect/sdk/compare/ui-react-2.0.3...ui-react-2.0.4) (2024-06-07)

## [2.0.3](https://github.com/ton-connect/sdk/compare/ui-react-2.0.3-beta.4...ui-react-2.0.3) (2024-05-28)

## [2.0.3-beta.4](https://github.com/ton-connect/sdk/compare/ui-react-2.0.3-beta.3...ui-react-2.0.3-beta.4) (2024-05-28)

## [2.0.3-beta.3](https://github.com/ton-connect/sdk/compare/ui-react-2.0.3-beta.2...ui-react-2.0.3-beta.3) (2024-05-27)

## [2.0.3-beta.2](https://github.com/ton-connect/sdk/compare/ui-react-2.0.3-beta.1...ui-react-2.0.3-beta.2) (2024-05-20)

## [2.0.3-beta.1](https://github.com/ton-connect/sdk/compare/ui-react-2.0.3-beta.0...ui-react-2.0.3-beta.1) (2024-05-20)

## [2.0.3-beta.0](https://github.com/ton-connect/sdk/compare/ui-react-2.0.2...ui-react-2.0.3-beta.0) (2024-05-09)

## [2.0.2](https://github.com/ton-connect/sdk/compare/ui-react-2.0.2-beta.1...ui-react-2.0.2) (2024-04-22)

## [2.0.2-beta.1](https://github.com/ton-connect/sdk/compare/ui-react-2.0.2-beta.0...ui-react-2.0.2-beta.1) (2024-04-22)

## [2.0.2-beta.0](https://github.com/ton-connect/sdk/compare/ui-react-2.0.1...ui-react-2.0.2-beta.0) (2024-04-22)

## [2.0.1](https://github.com/ton-connect/sdk/compare/ui-react-2.0.1-beta.9...ui-react-2.0.1) (2024-04-22)

## [2.0.1-beta.9](https://github.com/ton-connect/sdk/compare/ui-react-2.0.1-beta.8...ui-react-2.0.1-beta.9) (2024-04-21)

### Bug Fixes

- **ui-react:** prevent re-calculate friendly address on wallet unchanged in useTonAddress
  ([dfbe5ba](https://github.com/ton-connect/sdk/commit/dfbe5ba009bbfd97324e7b06ce5f08bbbd35f779))
- **ui-react:** set current modal state on first call of use effect in useTonConnectModal
  ([a881c7f](https://github.com/ton-connect/sdk/commit/a881c7f739c54ef0f5dd9efb7c10f12ed659f90e))
- **ui-react:** set current wallet on first call of use effect in useTonWallet
  ([3f2954a](https://github.com/ton-connect/sdk/commit/3f2954a1793c3b468170241605d0e78121a840db))

## [2.0.1-beta.8](https://github.com/ton-connect/sdk/compare/ui-react-2.0.1-beta.7...ui-react-2.0.1-beta.8) (2024-04-20)

## [2.0.1-beta.7](https://github.com/ton-connect/sdk/compare/ui-react-2.0.1-beta.6...ui-react-2.0.1-beta.7) (2024-04-20)

## [2.0.1-beta.6](https://github.com/ton-connect/sdk/compare/ui-react-2.0.1-beta.5...ui-react-2.0.1-beta.6) (2024-04-18)

## [2.0.1-beta.5](https://github.com/ton-connect/sdk/compare/ui-react-2.0.1-beta.4...ui-react-2.0.1-beta.5) (2024-04-12)

## [2.0.1-beta.4](https://github.com/ton-connect/sdk/compare/ui-react-2.0.1-beta.3...ui-react-2.0.1-beta.4) (2024-03-25)

## [2.0.1-beta.3](https://github.com/ton-connect/sdk/compare/ui-react-2.0.1-beta.2...ui-react-2.0.1-beta.3) (2024-03-08)

## [2.0.1-beta.2](https://github.com/ton-connect/sdk/compare/ui-react-2.0.1-beta.1...ui-react-2.0.1-beta.2) (2024-03-08)

## [2.0.1-beta.1](https://github.com/ton-connect/sdk/compare/ui-react-2.0.1-beta.0...ui-react-2.0.1-beta.1) (2024-02-29)

## [2.0.1-beta.0](https://github.com/ton-connect/sdk/compare/ui-react-2.0.0...ui-react-2.0.1-beta.0) (2024-01-08)

# [2.0.0](https://github.com/ton-connect/sdk/compare/ui-react-2.0.0-beta.10...ui-react-2.0.0) (2023-12-26)

# [2.0.0-beta.10](https://github.com/ton-connect/sdk/compare/ui-react-2.0.0-beta.9...ui-react-2.0.0-beta.10) (2023-12-19)

# [2.0.0-beta.9](https://github.com/ton-connect/sdk/compare/ui-react-2.0.0-beta.8...ui-react-2.0.0-beta.9) (2023-12-15)

# [2.0.0-beta.8](https://github.com/ton-connect/sdk/compare/ui-react-2.0.0-beta.7...ui-react-2.0.0-beta.8) (2023-12-02)

# [2.0.0-beta.7](https://github.com/ton-connect/sdk/compare/ui-react-2.0.0-beta.6...ui-react-2.0.0-beta.7) (2023-12-01)

# [2.0.0-beta.6](https://github.com/ton-connect/sdk/compare/ui-react-2.0.0-beta.5...ui-react-2.0.0-beta.6) (2023-11-06)

# [2.0.0-beta.5](https://github.com/ton-connect/sdk/compare/ui-react-2.0.0-beta.4...ui-react-2.0.0-beta.5) (2023-11-02)

### Bug Fixes

- **ui-react:** add CommonJS support and update build process
  ([46642f6](https://github.com/ton-connect/sdk/commit/46642f649d11d10245f0e45a2eb27a3e4984769c))

### Features

- **ui-react:** add enableAndroidBackHandler config option for android back button handling
  ([519e7e3](https://github.com/ton-connect/sdk/commit/519e7e305b3d3d8cd4a6e31656ad1b2fe0309b73))

# [2.0.0-beta.4](https://github.com/ton-connect/sdk/compare/ui-react-2.0.0-beta.3...ui-react-2.0.0-beta.4) (2023-10-25)

# [2.0.0-beta.3](https://github.com/ton-connect/sdk/compare/ui-react-2.0.0-beta.2...ui-react-2.0.0-beta.3) (2023-10-20)

### Features

- **ui-react:** add useTonConnectModal() hook for modal management
  ([d1e2381](https://github.com/ton-connect/sdk/commit/d1e238154694d142bae67b21bfc81deb30647d49))

# [2.0.0-beta.2](https://github.com/ton-connect/sdk/compare/ui-react-2.0.0-beta.1...ui-react-2.0.0-beta.2) (2023-09-15)

### Bug Fixes

- **ui-react:** next js compatibility
  ([a746046](https://github.com/ton-connect/sdk/commit/a74604643d65b010b2043b7edf642370c976324b))

# [2.0.0-beta.1](https://github.com/ton-connect/sdk/compare/ui-react-2.0.0-beta.0...ui-react-2.0.0-beta.1) (2023-09-12)

# [2.0.0-beta.0](https://github.com/ton-connect/sdk/compare/ui-react-1.0.0-beta.9...ui-react-2.0.0-beta.0) (2023-09-08)

### Bug Fixes

- **ui-react:** useTonWallet hook types changed
  ([456f5eb](https://github.com/ton-connect/sdk/commit/456f5ebdc061b35aa131c0f2a892dc49ebdcf2ba))

### BREAKING CHANGES

- **ui-react:** `useTonWallet` now returns `Wallet | (Wallet & WalletInfoWithOpenMethod) | null`
  instead of `(Wallet & WalletInfoWithOpenMethod) | null`

# [1.0.0-beta.9](https://github.com/ton-connect/sdk/compare/ui-react-1.0.0-beta.8...ui-react-1.0.0-beta.9) (2023-08-18)

# [1.0.0-beta.8](https://github.com/ton-connect/sdk/compare/ui-react-1.0.0-beta.7...ui-react-1.0.0-beta.8) (2023-08-18)

# [1.0.0-beta.7](https://github.com/ton-connect/sdk/compare/ui-react-1.0.0-beta.6...ui-react-1.0.0-beta.7) (2023-08-11)

### Bug Fixes

- **ui:** ios universal links issue fixed
  ([513b4ae](https://github.com/ton-connect/sdk/commit/513b4aed8e779d276ac353cbc17838da773e7e86))

# [1.0.0-beta.6](https://github.com/ton-connect/sdk/compare/ui-react-1.0.0-beta.5...ui-react-1.0.0-beta.6) (2023-05-03)

### Bug Fixes

- **ui-react:** Connect wallet button container width set to 'fit-content'
  ([9ef2535](https://github.com/ton-connect/sdk/commit/9ef2535c9fa2032f89a761bc2317b3444e3e9aef))
- **ui-react:** Connect wallet button doesn't work with react-router-dom
  ([f5110ab](https://github.com/ton-connect/sdk/commit/f5110ab52b9092322000daf505cdd3c23a262fad))

# [1.0.0-beta.5](https://github.com/ton-connect/sdk/compare/ui-react-1.0.0-beta.4...ui-react-1.0.0-beta.5) (2023-04-25)

### Bug Fixes

- **ui-react:** mobile QR modal added for non-mobile user agents (TWA)
  ([5fbf104](https://github.com/ton-connect/sdk/commit/5fbf104b0de5b4759dc070aea54299a441ca151c))

# [1.0.0-beta.4](https://github.com/ton-connect/sdk/compare/ui-react-1.0.0-beta.3...ui-react-1.0.0-beta.4) (2023-04-06)

### Bug Fixes

- **ui-react:** deps libs removed from the bundle
  ([b06a136](https://github.com/ton-connect/sdk/commit/b06a1360fe65abaeafbcb3a373fe3090393664d3))

# [1.0.0-beta.3](https://github.com/ton-connect/sdk/compare/ui-react-1.0.0-beta.2...ui-react-1.0.0-beta.3) (2023-03-27)

### Bug Fixes

- **ui-react:** README updated
  ([2720ad1](https://github.com/ton-connect/sdk/commit/2720ad1a10dacbcd2445751091e9e25862777f6d))

# [1.0.0-beta.2](https://github.com/ton-connect/sdk/compare/ui-react-1.0.0-beta.1...ui-react-1.0.0-beta.2) (2023-03-22)

# [1.0.0-beta.1](https://github.com/ton-connect/sdk/compare/ui-react-1.0.0-beta.0...ui-react-1.0.0-beta.1) (2023-03-22)

# [1.0.0-beta.0](https://github.com/ton-connect/sdk/compare/ui-react-0.0.14...ui-react-1.0.0-beta.0) (2023-03-22)

### Bug Fixes

- **ui-react:** `walletsList` replaced with `walletsListConfiguration`
  ([7276f52](https://github.com/ton-connect/sdk/commit/7276f5264ccd9d429957f47c6addaa569bf85502))
- **ui-react:** hooks ssr compatibility fixes
  ([4d7e605](https://github.com/ton-connect/sdk/commit/4d7e6050070cec3f38adaf4095bd0bd59e257575))
- **ui-react:** typings fixes
  ([2784439](https://github.com/ton-connect/sdk/commit/2784439f2ba6129bb132dd4c56152319c14204da))
- **ui-react:** useTonWallet hook refactored
  ([0254ad0](https://github.com/ton-connect/sdk/commit/0254ad0376a33e44c19e33df28be022b7b2f14e5))
- **ui-react:** wallets list source customization removed
  ([b09b262](https://github.com/ton-connect/sdk/commit/b09b26203b4893e3b07b19cbc9cef5d348fbe378))

## [0.0.14](https://github.com/ton-connect/sdk/compare/ui-react-0.0.13...ui-react-0.0.14) (2023-01-30)

## [0.0.13](https://github.com/ton-connect/sdk/compare/ui-react-0.0.12...ui-react-0.0.13) (2023-01-26)

### Bug Fixes

- **ui-react:** return strategy added
  ([ff2db16](https://github.com/ton-connect/sdk/commit/ff2db163d2bde9b2c07de464e851f164aaf43684))

## [0.0.12](https://github.com/ton-connect/sdk/compare/ui-react-0.0.11...ui-react-0.0.12) (2023-01-23)

### Bug Fixes

- **ui-react:** ssr compatibility added
  ([f33a072](https://github.com/ton-connect/sdk/commit/f33a07245bd27a7310ffcace10cb2c1e86071dc9))

## [0.0.11](https://github.com/ton-connect/sdk/compare/ui-react-0.0.10...ui-react-0.0.11) (2023-01-18)

### Bug Fixes

- **ui-react:** ton proof was being applied in embedded wallet browser
  ([2079597](https://github.com/ton-connect/sdk/commit/2079597de2966ab3714654fb312d819f0683fbe5))

## [0.0.10](https://github.com/ton-connect/sdk/compare/ui-react-0.0.9...ui-react-0.0.10) (2023-01-18)

### Bug Fixes

- **ui-react:** tonconnect/ui version updated. Connection restoring indicator hook added
  ([162e03f](https://github.com/ton-connect/sdk/commit/162e03fada1c717fbfb1f711ef62b62d1cf34e8d))

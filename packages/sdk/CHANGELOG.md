# Changelog @tonconnect/sdk

## 3.4.1

### Patch Changes

- 1a2b61f: Removed additional property with traceId

## 3.4.0

### Minor Changes

- 3964cf3: feat: add analytics settings and performance metrics
    - Added analytics settings with telemetry mode configuration
    - Added RTT (Round Trip Time) measurement
    - Added TTFB (Time To First Byte) measurement
    - Added wallet list download duration tracking

    These metrics help monitor SDK performance and user experience.

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

- 2cbf8a8: feat: add comprehensive analytics tracking system
    - added tracking for all major TON Connect interactions including connection lifecycle
      (connection-started, connection-selected-wallet, connection-completed, connection-error),
      disconnection, transactions (transaction-sent, transaction-signed,
      transaction-signing-failed), sign data requests, bridge client events
      (bridge-client-connect-started, bridge-client-connect-established,
      bridge-client-connect-error, bridge-client-message-sent, bridge-client-message-received,
      bridge-client-message-decode-error), and JS Bridge events (js-bridge-call, js-bridge-response,
      js-bridge-error)

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

- 7493b12: feat: add WalletConnect integration support

    Use `initializeWalletConnect()` to enable WalletConnect in your app.

    **Usage:**

    ```typescript
    import { initializeWalletConnect } from '@tonconnect/sdk';
    import { UniversalConnector } from '@reown/appkit-universal-connector';

    initializeWalletConnect(UniversalConnector, {
        projectId: 'YOUR_PROJECT_ID',
        metadata: {
            name: 'My DApp',
            description: 'My awesome DApp',
            url: 'https://mydapp.com',
            icons: ['https://mydapp.com/icon.png']
        }
    });
    ```

    Get your project ID at https://dashboard.reown.com/

### Patch Changes

- 36dbff1: fix: fix double analytics creation due to a merge request
- 3964cf3: feat: improve bridge connection and loading performance
    - Actualized wallet bridges with updated connection handling
    - Improved loading performance by not waiting for all gateways to open
    - Added minimum gateway connection threshold for faster initialization
    - Enhanced error handling for bridge connections

- 3a4d37d: feat: don't cancel transaction when proof has extra properties
- 3d6f982: fix: allow network mismatch in QA mode during wallet connection
    - Network validation during wallet connection now respects QA mode
    - When QA mode is enabled, network mismatches during connection are logged to console instead of
      throwing `WalletWrongNetworkError`
    - This allows testing with wallets connected to different networks without errors
    - Network validation in `sendTransaction` and `signData` already respected QA mode, now
      connection validation is consistent

    **Usage:**

    ```typescript
    import { enableQaMode } from '@tonconnect/ui-react';

    // Enable QA mode to bypass network validation
    enableQaMode();

    // Now you can connect to wallets on any network without errors
    // Network mismatches will be logged to console instead
    ```

- Updated dependencies [afcdd9b]
    - @tonconnect/protocol@2.4.0

## 3.4.0-beta.7

### Patch Changes

- 36dbff1: fix: fix double analytics creation due to a merge request

## 3.4.0-beta.6

### Minor Changes

- 3964cf3: feat: add analytics settings and performance metrics
    - Added analytics settings with telemetry mode configuration
    - Added RTT (Round Trip Time) measurement
    - Added TTFB (Time To First Byte) measurement
    - Added wallet list download duration tracking

    These metrics help monitor SDK performance and user experience.

## 3.4.0-beta.5

### Minor Changes

- 3964cf3: feat: add analytics settings and performance metrics
    - Added analytics settings with telemetry mode configuration
    - Added RTT (Round Trip Time) measurement
    - Added TTFB (Time To First Byte) measurement
    - Added wallet list download duration tracking

    These metrics help monitor SDK performance and user experience.

### Patch Changes

- 3964cf3: feat: improve bridge connection and loading performance
    - Actualized wallet bridges with updated connection handling
    - Improved loading performance by not waiting for all gateways to open
    - Added minimum gateway connection threshold for faster initialization
    - Enhanced error handling for bridge connections

## 3.4.0-beta.4

### Patch Changes

- 3a4d37d: feat: don't cancel transaction when proof has extra properties

## 3.4.0-beta.3

### Patch Changes

- 3d6f982: fix: allow network mismatch in QA mode during wallet connection
    - Network validation during wallet connection now respects QA mode
    - When QA mode is enabled, network mismatches during connection are logged to console instead of
      throwing `WalletWrongNetworkError`
    - This allows testing with wallets connected to different networks without errors
    - Network validation in `sendTransaction` and `signData` already respected QA mode, now
      connection validation is consistent

    **Usage:**

    ```typescript
    import { enableQaMode } from '@tonconnect/ui-react';

    // Enable QA mode to bypass network validation
    enableQaMode();

    // Now you can connect to wallets on any network without errors
    // Network mismatches will be logged to console instead
    ```

## 3.4.0-beta.2

### Minor Changes

- 7493b12: feat: add WalletConnect integration support

    Use `initializeWalletConnect()` to enable WalletConnect in your app.

    **Usage:**

    ```typescript
    import { initializeWalletConnect } from '@tonconnect/sdk';
    import { UniversalConnector } from '@reown/appkit-universal-connector';

    initializeWalletConnect(UniversalConnector, {
        projectId: 'YOUR_PROJECT_ID',
        metadata: {
            name: 'My DApp',
            description: 'My awesome DApp',
            url: 'https://mydapp.com',
            icons: ['https://mydapp.com/icon.png']
        }
    });
    ```

    Get your project ID at https://dashboard.reown.com/

## 3.4.0-beta.1

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

### Patch Changes

- Updated dependencies [afcdd9b]
    - @tonconnect/protocol@2.4.0-beta.0

## 3.4.0-beta.0

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

## 3.3.1

### Patch Changes

- f9735ee: chore: update fallback wallets list to match config.ton.org/wallets-v2.json
- 958e7b3: feat: add base64 normalization to support URL-safe base64 encoding
- 143ec17: feat: migrate wallet list URL to config.ton.org/wallets-v2.json

## 3.3.1-beta.0

### Patch Changes

- f9735ee: chore: update fallback wallets list to match config.ton.org/wallets-v2.json
- 958e7b3: feat: add base64 normalization to support URL-safe base64 encoding
- 143ec17: feat: migrate wallet list URL to config.ton.org/wallets-v2.json

## 3.3.0

### Patch Changes

- c90140a: chore: update dependencies
- 4d80c1f: feat: add id support for links (per spec
  https://github.com/ton-blockchain/ton-connect/pull/90/files)
- 4d80c1f: fix(ui): prevent enabling scroll if already enabled
- 4d80c1f: fix(sdk): do not cache injected wallets in wallets list manager
- 1e2f8f5: feat: implement validation for sendTransaction and signData feat: add qa mode
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

## 3.3.0-beta.3

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

## 3.3.0-beta.2

### Patch Changes

- chore: update dependencies

## 3.3.0-beta.1

### Patch Changes

- **feat**: implement validation for sendTransaction and signData
- **feat**: add qa mode

# [3.3.0-beta.0](https://github.com/ton-connect/sdk/compare/sdk-3.2.0...sdk-3.3.0-beta.0) (2025-07-25)

### Bug Fixes

- **sdk:** catch operation aborted error
  ([1e3d042](https://github.com/ton-connect/sdk/commit/1e3d04270973ddef284584a457d27a340f75565c))

# [3.2.0](https://github.com/ton-connect/sdk/compare/sdk-3.2.0-beta.0...sdk-3.2.0) (2025-06-25)

### Bug Fixes

- fix error message bug
  ([8b8da60](https://github.com/ton-connect/sdk/commit/8b8da60bea89e6c48d9f26418e4b2986a952d82e))
- **sdk:** filter fields in proof object
  ([067a328](https://github.com/ton-connect/sdk/commit/067a328be52bd787a337f3b32eb03657a82c51c0))
- **sdk:** fix infinity loading button in sign data modal
  ([4e74403](https://github.com/ton-connect/sdk/commit/4e74403b7eb0a91ee07349537952e02864590d14))

### Features

- **sdk:** add network and protocol fields to signData request
  ([fcfc8b3](https://github.com/ton-connect/sdk/commit/fcfc8b353b9775784b6f0c7b1e59c0321f0d2d32))

# [3.2.0-beta.0](https://github.com/ton-connect/sdk/compare/sdk-3.1.1-beta.0...sdk-3.2.0-beta.0) (2025-05-08)

### Features

- **sdk:** implement SignData feature
  ([c5f2ac8](https://github.com/ton-connect/sdk/commit/c5f2ac8c7af260075b1717b16748bfa2fd12ef8f))
- **sdk:** include cause info in WalletNotSupportFeatureError
  ([11a645c](https://github.com/ton-connect/sdk/commit/11a645c99780577887ddaab271b086d5a329f2d3))

## [3.1.1-beta.0](https://github.com/ton-connect/sdk/compare/sdk-3.1.0...sdk-3.1.1-beta.0) (2025-03-27)

### Features

- **sdk:** add pending connection expiration
  ([1e3a1a9](https://github.com/ton-connect/sdk/commit/1e3a1a9fd4e981d3cee0403e9131728dba66b287))

# [3.1.0](https://github.com/ton-connect/sdk/compare/sdk-3.0.8-beta.0...sdk-3.1.0) (2025-03-24)

### Features

- **sdk:** refactor wallet required features from array to object structure
  ([b21c062](https://github.com/ton-connect/sdk/commit/b21c062283655bc00affcdda42b04a6a7fbdcf2f))

## [3.0.8-beta.0](https://github.com/ton-connect/sdk/compare/sdk-3.0.7...sdk-3.0.8-beta.0) (2025-03-18)

### Bug Fixes

- eslint source tags
  ([4aaca93](https://github.com/ton-connect/sdk/commit/4aaca93fe7b53e317a0ffa4b0d78b61026dd0948))

### Features

- **sdk:** add support for required features
  ([a33480f](https://github.com/ton-connect/sdk/commit/a33480f64fdfe9ef36eb4359cbc31ca5cc9c7d58))

## [3.0.7](https://github.com/ton-connect/sdk/compare/sdk-3.0.7-alpha.1...sdk-3.0.7) (2025-03-06)

## [3.0.7-alpha.1](https://github.com/ton-connect/sdk/compare/sdk-3.0.7-alpha.0...sdk-3.0.7-alpha.1) (2025-02-18)

### Features

- **sdk:** rename `extraCurrencies` to `extraCurrency`, and change `extraCurrency` format to use
  object map
  ([312696f](https://github.com/ton-connect/sdk/commit/312696f75b1921d84e43a192eecee63e98f30e96))

## [3.0.7-alpha.0](https://github.com/ton-connect/sdk/compare/sdk-3.0.6...sdk-3.0.7-alpha.0) (2025-02-17)

### Features

- **sdk:** implement extra currencies support in send transaction
  ([01e658f](https://github.com/ton-connect/sdk/commit/01e658fc756266fde7d9fbc10a0021cba5444383))

## [3.0.6](https://github.com/ton-connect/sdk/compare/sdk-3.0.6-beta.0...sdk-3.0.6) (2025-01-13)

## [3.0.6-beta.0](https://github.com/ton-connect/sdk/compare/sdk-3.0.5...sdk-3.0.6-beta.0) (2024-12-10)

### Features

- **sdk:** update fallback wallets list configuration
  ([283e5bf](https://github.com/ton-connect/sdk/commit/283e5bf3cf7f073bcee1bc868c321cc6fc55b500))

## [3.0.5](https://github.com/ton-connect/sdk/compare/sdk-3.0.4...sdk-3.0.5) (2024-08-09)

### Features

- **sdk:** update fallback wallets list
  ([ec3fdd3](https://github.com/ton-connect/sdk/commit/ec3fdd30f1583951461737c21c45153b866925d8))

## [3.0.4](https://github.com/ton-connect/sdk/compare/sdk-3.0.4-beta.2...sdk-3.0.4) (2024-08-09)

## [3.0.4-beta.2](https://github.com/ton-connect/sdk/compare/sdk-3.0.4-beta.1...sdk-3.0.4-beta.2) (2024-07-31)

### Bug Fixes

- **sdk:** remove redundant `connectionEstablished` parameter
  ([dce8a6b](https://github.com/ton-connect/sdk/commit/dce8a6b8100dcdefe993028cee75b7d39a844238))

## [3.0.4-beta.1](https://github.com/ton-connect/sdk/compare/sdk-3.0.4-beta.0...sdk-3.0.4-beta.1) (2024-07-31)

### Bug Fixes

- **sdk:** fine-tune timeouts and enhance error handling for bridge reconnection
  ([6538103](https://github.com/ton-connect/sdk/commit/6538103f85b80b3091a6284c5cb5bf4cd155e68a))

## [3.0.4-beta.0](https://github.com/ton-connect/sdk/compare/sdk-3.0.3...sdk-3.0.4-beta.0) (2024-07-31)

### Bug Fixes

- **sdk:** ensure reconnection to bridge during prolonged handshake interruptions
  ([6ff4761](https://github.com/ton-connect/sdk/commit/6ff4761431c91511e8430abee537ba353eecd950))

## [3.0.3](https://github.com/ton-connect/sdk/compare/sdk-3.0.3-beta.1...sdk-3.0.3) (2024-05-28)

## [3.0.3-beta.1](https://github.com/ton-connect/sdk/compare/sdk-3.0.3-beta.0...sdk-3.0.3-beta.1) (2024-05-27)

### Features

- **sdk:** enhanced event tracking and version management
  ([cfc013d](https://github.com/ton-connect/sdk/commit/cfc013d6a6683352c95dfd5b48e5b005162c8ea5))

## [3.0.3-beta.0](https://github.com/ton-connect/sdk/compare/sdk-3.0.2...sdk-3.0.3-beta.0) (2024-05-20)

### Features

- **sdk:** integrate user action tracking
  ([e831385](https://github.com/ton-connect/sdk/commit/e831385e3ba8df40c86b18572713cabbb57e4ba4))

## [3.0.2](https://github.com/ton-connect/sdk/compare/sdk-3.0.2-beta.0...sdk-3.0.2) (2024-04-22)

## [3.0.2-beta.0](https://github.com/ton-connect/sdk/compare/sdk-3.0.1...sdk-3.0.2-beta.0) (2024-04-22)

### Bug Fixes

- **sdk:** ensures pausing the connection then attempts to unpause it
  ([346b13b](https://github.com/ton-connect/sdk/commit/346b13b303fbefe2cccab8851a8515469084872c))

## [3.0.1](https://github.com/ton-connect/sdk/compare/sdk-3.0.1-beta.2...sdk-3.0.1) (2024-04-22)

## [3.0.1-beta.2](https://github.com/ton-connect/sdk/compare/sdk-3.0.1-beta.1...sdk-3.0.1-beta.2) (2024-04-20)

### Bug Fixes

- **sdk:** ensure promise resolution when event source is recreated
  ([348ab1d](https://github.com/ton-connect/sdk/commit/348ab1d78e8f7253ded6463c5b52e748633f5948))

## [3.0.1-beta.1](https://github.com/ton-connect/sdk/compare/sdk-3.0.1-beta.0...sdk-3.0.1-beta.1) (2024-04-18)

### Bug Fixes

- **sdk:** enhance gateway management for efficient closure
  ([70f24f9](https://github.com/ton-connect/sdk/commit/70f24f98e0ce447928edf8bf6a738a88d6c833ee))
- **sdk:** remove sessions immediately if no bridge connection
  ([71f287c](https://github.com/ton-connect/sdk/commit/71f287c7328b4892ff80647638dfe0386cd43d2d))

## [3.0.1-beta.0](https://github.com/ton-connect/sdk/compare/sdk-3.0.0...sdk-3.0.1-beta.0) (2024-04-12)

### Bug Fixes

- **sdk:** checks if the signal is already aborted
  ([fa18cb2](https://github.com/ton-connect/sdk/commit/fa18cb21e2ea542e5045f74af8b601086730628e))
- **sdk:** ensure closure of previously opened gateway
  ([d4d1d50](https://github.com/ton-connect/sdk/commit/d4d1d50c8fe16fbe2624c2663cacea350974903c))
- **sdk:** ensuring the disconnect is called only if the provider is defined
  ([9b2bd71](https://github.com/ton-connect/sdk/commit/9b2bd7124477d21053e0159ace82202e311dfc1a))
- **sdk:** improve abort handling in connection and send methods
  ([dd87b04](https://github.com/ton-connect/sdk/commit/dd87b04e31614df01e6209a618b186c8b3d78d55))
- **sdk:** improve error handling in bridge gateway
  ([ea2aa79](https://github.com/ton-connect/sdk/commit/ea2aa79ffa0f80a755a762fae2090729ac7c8606))

### Features

- **sdk:** update fallback wallets list
  ([de9520d](https://github.com/ton-connect/sdk/commit/de9520df606beb55e56d1f6af6bfec729c163530))

# [3.0.0](https://github.com/ton-connect/sdk/compare/sdk-3.0.0-beta.6...sdk-3.0.0) (2023-12-26)

# [3.0.0-beta.6](https://github.com/ton-connect/sdk/compare/sdk-3.0.0-beta.5...sdk-3.0.0-beta.6) (2023-12-19)

### Bug Fixes

- **sdk:** added tonkeeper deeplink to the fallback wallets list
  ([6aa3ec4](https://github.com/ton-connect/sdk/commit/6aa3ec46283d9e962f8be7e28c2ab6529828a1f2))
- **sdk:** tonkeeper desktop platform added
  ([c9b1bcd](https://github.com/ton-connect/sdk/commit/c9b1bcddc71a29926368ce2079fb7c4b602d27f6))

# [3.0.0-beta.5](https://github.com/ton-connect/sdk/compare/sdk-3.0.0-beta.4...sdk-3.0.0-beta.5) (2023-12-02)

### Bug Fixes

- **sdk:** added waiting for bridge response before calling onRequestSent
  ([cf85057](https://github.com/ton-connect/sdk/commit/cf850572feef8d9720aba062fd6b1d76037ceb93))

# [3.0.0-beta.4](https://github.com/ton-connect/sdk/compare/sdk-3.0.0-beta.3...sdk-3.0.0-beta.4) (2023-12-01)

### Bug Fixes

- **sdk:** throw TonConnectError for non-2xx bridge responses
  ([97710a6](https://github.com/ton-connect/sdk/commit/97710a6d38e347c13799c9973f26ec10d48337f4))

### Features

- **sdk:** add onRequestSent callback to sendTransaction
  ([86f6bed](https://github.com/ton-connect/sdk/commit/86f6bed7dc03c7c156862cccdad1218cef5b33c9))
- **sdk:** migrate Telegram links to direct links
  ([0d975d1](https://github.com/ton-connect/sdk/commit/0d975d1bfe0a5ffb6996f8c4dc31cf0cf90aa5f7))

# [3.0.0-beta.3](https://github.com/ton-connect/sdk/compare/sdk-3.0.0-beta.2...sdk-3.0.0-beta.3) (2023-11-06)

# [3.0.0-beta.2](https://github.com/ton-connect/sdk/compare/sdk-3.0.0-beta.1...sdk-3.0.0-beta.2) (2023-11-02)

### Bug Fixes

- **sdk:** mock localStorage in Safari private mode
  ([0d30b83](https://github.com/ton-connect/sdk/commit/0d30b8399a188de6ae9dc9dbd952639a761d3c06)),
  closes [#93](https://github.com/ton-connect/sdk/issues/93)

### Features

- **sdk:** change address format from bounceable to no-bounceable
  ([a000d6e](https://github.com/ton-connect/sdk/commit/a000d6ed6974babdbb335b47e0221c852890cb26))

# [3.0.0-beta.1](https://github.com/ton-connect/sdk/compare/sdk-3.0.0-beta.0...sdk-3.0.0-beta.1) (2023-09-12)

### Bug Fixes

- **sdk:** bridge unavailability handled, max timeout added
  ([c0056d5](https://github.com/ton-connect/sdk/commit/c0056d5df16c15fc17bdd6e6bf119ff6c8cd60dc))

# [3.0.0-beta.0](https://github.com/ton-connect/sdk/compare/sdk-2.2.0...sdk-3.0.0-beta.0) (2023-09-08)

### Bug Fixes

- **sdk:** storing pending connection
  ([260653c](https://github.com/ton-connect/sdk/commit/260653c4ccb9acef09d1c983a1207d5957b6de80))
- **sdk:** telegram parameters encoding function exported
  ([95fc07b](https://github.com/ton-connect/sdk/commit/95fc07b399d808ab99b07804ecf7bbc9963730f8))

### Features

- **sdk:** new wallets-list source added
  ([07f25de](https://github.com/ton-connect/sdk/commit/07f25de8910d8efb9d972a2f64c4375aaf579c99))

# [2.2.0](https://github.com/ton-connect/sdk/compare/sdk-2.1.4...sdk-2.2.0) (2023-08-18)

### Bug Fixes

- **sdk:** `app_name` added to WalletInfo
  ([a0fa12e](https://github.com/ton-connect/sdk/commit/a0fa12ebb976f385a3f870a3b551fb74fc591136))

### Features

- **sdk:** [@wallet](https://github.com/wallet) universal links supported
  ([05f7000](https://github.com/ton-connect/sdk/commit/05f70005523808694bcb985584f49b6eb039b1b3))

## [2.1.4](https://github.com/ton-connect/sdk/compare/sdk-2.1.3...sdk-2.1.4) (2023-08-15)

### Bug Fixes

- 'platform' field added to WalletInfo
  ([40e0332](https://github.com/ton-connect/sdk/commit/40e0332a37886baef6aaa9942a8fad7a2e29d78b))
- **sdk:** README updated
  ([900c115](https://github.com/ton-connect/sdk/commit/900c115bd71aa631026f60e55632e03d7b185784))

## [2.1.3](https://github.com/ton-connect/sdk/compare/sdk-2.1.2...sdk-2.1.3) (2023-04-03)

### Bug Fixes

- **sdk:** wallets list cache option added. `WalletsListManager` exported
  ([52fe8f6](https://github.com/ton-connect/sdk/commit/52fe8f6ecd8890b05382520b91587877cae882ae))

## [2.1.2](https://github.com/ton-connect/sdk/compare/sdk-2.1.1...sdk-2.1.2) (2023-03-22)

### Bug Fixes

- **sdk:** wallets list fallback added
  ([518c87b](https://github.com/ton-connect/sdk/commit/518c87b9c5a5f9c41626ba352414e0392d28d681))
- **sdk:** wallets list tests added
  ([f8784fc](https://github.com/ton-connect/sdk/commit/f8784fc8971053490098d6946b6fead964f1ad85))

## [2.1.1](https://github.com/ton-connect/sdk/compare/sdk-2.1.0...sdk-2.1.1) (2023-03-22)

### Bug Fixes

- **sdk:** extension was disabled after wallet connection check added
  ([b13d1e1](https://github.com/ton-connect/sdk/commit/b13d1e15428b1f05ab71d3f2412e94e3f4f12415))
- **sdk:** fetch wallets list error when window contains iframe fixed
  ([b1f338a](https://github.com/ton-connect/sdk/commit/b1f338a34159b7c3251271a38a3579cc6b7a2a84))
- **sdk:** option to disable auto pause/unpause SSE connection on 'document.visibilitychange' event
  added
  ([5b1aeff](https://github.com/ton-connect/sdk/commit/5b1aeff0827722d84c7a675046b9484a222a7e7e))

# [2.1.0](https://github.com/ton-connect/sdk/compare/sdk-2.0.7...sdk-2.1.0) (2023-03-17)

### Bug Fixes

- **sdk:** `Features` format changed
  ([15341eb](https://github.com/ton-connect/sdk/commit/15341eb99c01c69c75a3070ab9b13188c77b78be))
- **sdk:** `from` and `network` properties added to the `SendTransactionRequest`
  ([2e1af4d](https://github.com/ton-connect/sdk/commit/2e1af4d278ea128e6c0437d429e9c2cc97747bf9))
- **sdk:** `pauseConnection` and `unPauseConnection` methods added. Connection automatically pauses
  and unpauses on `window` `blur` and `focus`.
  ([7ee7ce3](https://github.com/ton-connect/sdk/commit/7ee7ce3351b1943123353bab950a91108fb98cbd))
- **sdk:** `publicKey` added to the `Account`
  ([74b25c7](https://github.com/ton-connect/sdk/commit/74b25c7f3acd892214287907c80915d88c548768))
- **sdk:** backward compatibility fixed. `WalletInfoInjected` marked as deprecated
  ([b567640](https://github.com/ton-connect/sdk/commit/b5676403a7c8e980c1e5bd24c5e9afa93c876d75))
- **sdk:** building process refactored. ES module output fixes
  ([490378b](https://github.com/ton-connect/sdk/commit/490378be5db130970a8a066440ca2d1df74606af))
- **sdk:** disconnect rpc call added
  ([c036602](https://github.com/ton-connect/sdk/commit/c0366026b16156d69596a84771a1f0d669bda746))
- **sdk:** disconnect rpc request call added
  ([a079b8a](https://github.com/ton-connect/sdk/commit/a079b8a5870136b19be65b33361b812edc92719f))
- **sdk:** disconnect rpc request fixes
  ([dd7d006](https://github.com/ton-connect/sdk/commit/dd7d0068faff517f5dd9fe9858b39b10a360f93a))
- **sdk:** errors description added
  ([73bbb6e](https://github.com/ton-connect/sdk/commit/73bbb6ef4590ba10661a2f1e26f97201ba571892))
- **sdk:** event id local storage bugs fixes
  ([068c3dc](https://github.com/ton-connect/sdk/commit/068c3dc13e5923c174a86099f6e26abec6154810))
- **sdk:** http-bridge fixes:
  ([d91f1f3](https://github.com/ton-connect/sdk/commit/d91f1f3d3231dc0b87386b413e8b9e50f3d4ae26))
- **sdk:** injected wallet metadata merged with wallets-list metadata
  ([7224b8e](https://github.com/ton-connect/sdk/commit/7224b8ecddf60e68137a57ef435a130e499f776f))
- **sdk:** internal event id added
  ([cd0d463](https://github.com/ton-connect/sdk/commit/cd0d4631d54f9fbcbc5b26d48752bd221a8b1e30))
- **sdk:** isWalletInfoInjected changed. isWalletInfoEmbedded, isWalletInfoInjectable,
  ([6c5899d](https://github.com/ton-connect/sdk/commit/6c5899d30cfed92c2fe24e2832a120c1b3e50821))
- **sdk:** README updated
  ([9210127](https://github.com/ton-connect/sdk/commit/921012740963410d106d5b04d8309b9c30f8b2f4))
- **sdk:** requests id conflicts fixes. Types fixes: `isWalletInfoCurrentlyInjected`,
  `isWalletInfoCurrentlyEmbedded` added
  ([eb50c26](https://github.com/ton-connect/sdk/commit/eb50c26b72a4bc91ad921dac3a7686431353b36f))
- **sdk:** rpc request id stores in the localstorage
  ([2d2916b](https://github.com/ton-connect/sdk/commit/2d2916b44f5c59608b925188116884171bf61b06))
- **sdk:** topic parameter added to the bridge request
  ([7f134b9](https://github.com/ton-connect/sdk/commit/7f134b982e5540775b4401a5254e38f45b56c6b8))
- **sdk:** wallets list source changed
  ([2a8ce70](https://github.com/ton-connect/sdk/commit/2a8ce700144039ba1ae4bae315363f819cdbccf2))

### Features

- **sdk:** universal connection method added
  ([db62787](https://github.com/ton-connect/sdk/commit/db62787d3035238d8944e866b5671ccec6be6c37))

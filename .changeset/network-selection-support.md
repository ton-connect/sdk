---
'@tonconnect/protocol': minor
'@tonconnect/sdk': minor
'@tonconnect/ui': patch
---

feat: add network selection support for wallet connections

- Added `ChainId` type in `@tonconnect/protocol` to support arbitrary network identifiers (extends `CHAIN` enum with string)
- Added `setConnectionNetwork()` method in SDK and UI to specify desired network before connecting
- Added `network` field to `TonAddressItem` in connect requests to inform wallet about desired network
- Added `WalletWrongNetworkError` that is thrown when wallet connects to a different network than expected
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

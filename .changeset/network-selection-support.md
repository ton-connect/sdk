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
- Removed `setDesiredChainId` and `getDesiredChainId` methods - network must be set via `setConnectionNetwork()` before connecting

**Breaking changes:**
- `setDesiredChainId()` and `getDesiredChainId()` methods removed from SDK and UI
- Network must be specified via `setConnectionNetwork()` method before calling `connect()`

**Usage:**

```typescript
// Set desired network before connecting
const connector = new TonConnect();
connector.setConnectionNetwork(CHAIN.MAINNET); // or CHAIN.TESTNET, or any custom chainId string

// Connect wallet
connector.connect(walletConnectionSource);

// If wallet connects to a different network, WalletWrongNetworkError will be thrown
// UI will display a user-friendly error message

// Allow any network
connector.setConnectionNetwork(undefined);
```


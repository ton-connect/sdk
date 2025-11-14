---
'@tonconnect/protocol': minor
'@tonconnect/sdk': minor
'@tonconnect/ui': patch
---

feat: add network selection support for wallet connections

- Added `ChainId` type in `@tonconnect/protocol` to support arbitrary network identifiers (extends `CHAIN` enum with string)
- Added `network` field to `ConnectAdditionalRequest` to specify desired network during connection
- Added `network` field to `TonAddressItem` in connect requests to inform wallet about desired network
- Added `WalletWrongNetworkError` that is thrown when wallet connects to a different network than expected
- Network validation is performed on connect, `sendTransaction`, and `signData` operations
- UI modals now display user-friendly error messages when network mismatch occurs
- Removed `setDesiredChainId` and `getDesiredChainId` methods - network can only be set during `connect()` call

**Usage:**

```typescript
// Specify desired network during connection
const connector = new TonConnect();

connector.connect(
  walletConnectionSource,
  {
    network: '-239' // or CHAIN.MAINNET, CHAIN.TESTNET, or any custom chainId
  }
);

// If wallet connects to a different network, WalletWrongNetworkError will be thrown
// UI will display a user-friendly error message
```


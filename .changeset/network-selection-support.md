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
const connector = new TonConnect();

// Set desired network before connecting, possible values is CHAIN.MAINNET ('-239'), CHAIN.TESTNET ('-3'), or any custom chainId string
connector.setConnectionNetwork(CHAIN.MAINNET);

// Or allow any network if needed (default behavior)
// connector.setConnectionNetwork(undefined);

// Connect wallet
connector.connect(walletConnectionSource);

// If wallet connects to a different network, WalletWrongNetworkError will be thrown
// UI will display a user-friendly error message
```

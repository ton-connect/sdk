---
'@tonconnect/sdk': patch
---

fix: allow network mismatch in QA mode during wallet connection

- Network validation during wallet connection now respects QA mode
- When QA mode is enabled, network mismatches during connection are logged to console instead of throwing `WalletWrongNetworkError`
- This allows testing with wallets connected to different networks without errors
- Network validation in `sendTransaction` and `signData` already respected QA mode, now connection validation is consistent

**Usage:**

```typescript
import { enableQaMode } from '@tonconnect/ui-react';

// Enable QA mode to bypass network validation
enableQaMode();

// Now you can connect to wallets on any network without errors
// Network mismatches will be logged to console instead
```


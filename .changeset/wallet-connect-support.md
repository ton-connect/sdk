---
'@tonconnect/sdk': minor
'@tonconnect/ui': minor
---

feat: add WalletConnect integration support

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


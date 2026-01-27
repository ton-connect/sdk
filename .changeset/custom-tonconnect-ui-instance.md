---
'@tonconnect/ui-react': minor
---

feat: add support for custom TonConnectUI instance in TonConnectUIProvider

Added optional `tonConnectUI` prop to `TonConnectUIProvider` to allow passing a pre-initialized TonConnectUI instance. This enables:
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

---
'@tonconnect/sdk': minor
'@tonconnect/ui': minor
'@tonconnect/ui-react': minor
---

feat: add trace ID support for tracking user flows

- added UUIDv7-based trace IDs to aggregate multiple events into a single user flow
- trace IDs are automatically generated for all operations and added to links
- trace IDs are propagated through the entire connection lifecycle and included in all analytics events
- returned response objects now include `traceId` field for correlation with analytics data
- `sendTransaction` method now accepts optional `traceId` parameter in options:

```typescript
const result = await tonConnectUI.sendTransaction(
  {
    messages: [
      {
        address: "Ef9VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVbxn",
        amount: "20000000",
      },
    ],
  },
  {
    traceId: "019a2a92-a884-7cfc-b1bc-caab18644b6f" // optional, auto-generated if not provided
  }
);

console.log(result.traceId); // returns trace ID for tracking
```

- `signData` method now accepts optional `traceId` parameter in options:

```typescript
const result = await tonConnectUI.signData(
  {
    type: "text",
    text: "Hello, TON!",
  },
  {
    traceId: "019a2a92-a884-7cfc-b1bc-caab18644b6f" // optional, auto-generated if not provided
  }
);

console.log(result.traceId); // returns trace ID for tracking
```

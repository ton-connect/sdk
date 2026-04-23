# TON Connect Protocol Extensions — Briefing

---

## What Is It

Three protocol extensions for TON Connect that ship independently and require zero changes from existing apps:

1. **Structured Items** — high-level item types (`ton`, `jetton`, `nft`) for `sendTransaction` and `signMessage`, replacing manual BoC construction
2. **Sign Message** — new RPC method that signs internal messages without broadcasting, enabling gasless transactions in dApps
3. **Embedded Requests** — transaction request embedded directly in the connect URL, allowing connect + send in a single user action

---

## Who Is It For

**dApp developers** who want to:
- Send Jetton and NFT transfers without low-level binary payload construction
- Offer gasless UX where a relayer pays transaction fees on behalf of users
- Eliminate the two-step "connect then pay" flow for new users

**Wallet developers** who want to:
- Display clear, human-readable transfer details instead of raw hex
- Support gas sponsorship flows (W5 wallets)
- Handle connection and transaction approval in a single screen

**End users** who get:
- One-tap connect + pay instead of two separate approvals
- Gasless transactions (no TON balance needed for fees)
- Clear wallet UI showing "Send 10 USDT" instead of cryptic binary data

---

## Why Do We Need It

### Structured Items

Today, sending a Jetton (e.g. USDT) requires the dApp to resolve the Jetton wallet address, construct a TL-B encoded binary cell, and Base64-encode it manually. Every dApp reimplements the same 20+ lines of error-prone code. With structured items, the dApp describes **what** to do and the **wallet** constructs the BoC:

```typescript
await tonConnectUI.sendTransaction({
  validUntil: ...,
  items: [{ type: 'jetton', master: USDT, destination: recipient, amount: '1000000' }]
});
```

This also makes complex transfers possible in scenarios where the user address is not yet available (e.g. during the connect flow) — the wallet resolves addresses internally.

### Sign Message

Gasless transactions on TON require signing an internal message without broadcasting it to the network. A relayer wraps the signed message and pays gas on behalf of the user. There is currently no standard way to request "sign but don't send" across wallets. `signMessage` provides exactly this:

```typescript
const { internalBoc } = await tonConnectUI.signMessage({
  validUntil: ...,
  items: [{ type: 'jetton', master: USDT, destination: recipient, amount: '1000000' }]
});
await myRelayer.submitGasless(internalBoc);
```

### Embedded Requests

When a user clicks "Pay" but isn't connected, the current flow requires two wallet round-trips: connect first, return to the dApp, then approve the transaction. With embedded requests, the SDK includes the transaction in the connect URL. The wallet shows "Connect **and** approve this transaction" in one step. The developer's code doesn't change — the SDK handles it transparently.

---

## What It Covers

### Structured Items

- New optional `items` field in `sendTransaction` and `signMessage` payloads
- Three item types: `TonItem` (TON transfers), `JettonItem` (Jetton transfers), `NftItem` (NFT transfers)
- Wallet feature flag: `itemTypes` array in `SendTransaction` and `SignMessage` features
- Full backward compatibility — existing `messages` API continues to work unchanged

### Sign Message

- New RPC method `signMessage` with the same payload structure as `sendTransaction`
- Wallet signs internal messages with send mode 3 (`PAY_GAS_SEPARATELY + IGNORE_ERRORS`) without broadcasting
- Response returns `internalBoc` — the signed internal message BoC in Base64
- New `SignMessage` feature flag with `maxMessages` and optional `itemTypes`
- SDK method `TonConnectUI.signMessage()` with the same modal flow as `sendTransaction`

### Embedded Requests

- New optional `e` parameter in `tc://` connect URL containing a compact wire-format request (Base64-URL-encoded JSON)
- New optional `response` field on `ConnectEventSuccess` carrying the request result
- Compact wire format with abbreviated field names to fit within URL length limits
- Supports all three methods: `sendTransaction`, `signMessage`, `signData`
- Built-in double-payment safety:
  - `e` is never included in QR codes (multi-scan risk)
  - `e` is embedded only on the first wallet tap; subsequent taps get connect-only URLs
  - No auto-retry after dispatch — SDK provides `onConnected` callback for the developer to check on-chain status
- Graceful degradation — wallets that don't recognize `e` ignore it and connect normally; SDK falls back to the two-step flow

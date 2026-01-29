---
id: connect
name: Wallet Connection
summary: Connect wallets with optional TonProof for cryptographic ownership verification.
links:
  - title: TonProof Specification
    url: https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md#address-proof-signature-ton_proof
  - title: Protocol Spec
    url: https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md
  - title: Demo Backend (Go)
    url: https://github.com/ton-connect/demo-dapp-backend
---

## When to Use What

**Quick decision:** Does your backend need to trust that the user owns this wallet?

- **Yes** → Use TonProof
- **No** → Use Simple Connection

### Simple Connection

Use when your dApp only accesses publicly available data:

- **On-chain** — balance, transaction history, NFT collections, token holdings
- **Off-chain** — public profiles, leaderboards, activity stats (data anyone can see by address)
- **Transactions** — wallet signs each one separately, no pre-verification needed

**Rule:** If anyone can access this data knowing just the wallet address, and you're not granting private data or special permissions — Simple Connection is enough.

### TonProof Connection

Use when your backend must verify wallet ownership:

- **Authentication** — wallet-based login, user sessions
- **Private data** — personal settings, purchase history, private API endpoints
- **Permissions** — token-gated content, premium access, whitelist membership
- **Irreversible actions** — airdrops, rewards, one-time claims

**Rule:** If your backend stores private data for this address, grants special permissions, or performs actions that can't be undone — verify ownership with TonProof first.

## How It Works

### Simple Connection

1. User clicks connect
2. Wallet approves
3. You receive: address, public key, network

No backend required. No cryptographic verification.

### TonProof Connection

A challenge-response flow that cryptographically proves wallet ownership:

```
FRONTEND                BACKEND                 WALLET
   │                       │                       │
   │  1. Request challenge │                       │
   │──────────────────────>│                       │
   │                       │                       │
   │  2. Return payload    │                       │
   │<──────────────────────│                       │
   │                       │                       │
   │  3. Connect with ton_proof request            │
   │──────────────────────────────────────────────>│
   │                       │                       │
   │  4. User approves, wallet signs proof         │
   │<──────────────────────────────────────────────│
   │                       │                       │
   │  5. Send proof        │                       │
   │──────────────────────>│                       │
   │                       │                       │
   │                       │  6. Verify all checks │
   │                       │  (see table below)    │
   │                       │                       │
   │  7. Return auth token │                       │
   │<──────────────────────│                       │
   │                       │                       │
```

**What gets signed:** `timestamp + domain + payload`

## Backend Verification

All 6 checks must pass:

| Check | What to Verify |
|-------|----------------|
| Public key | Matches key extracted from StateInit |
| Address | Equals hash of StateInit |
| Domain | In your allowed whitelist |
| Timestamp | Within 15 minutes of current time |
| Payload | Matches the challenge you generated |
| Signature | Valid Ed25519 signature |

## Security

| Protection | How It Works |
|------------|--------------|
| Replay prevention | Proof expires after 15 minutes |
| Domain binding | Signature includes requesting domain |
| Challenge uniqueness | Each payload used only once |
| Address spoofing | StateInit verification ensures address authenticity |

## Error Codes

| Code | Meaning |
|------|---------|
| 0 | Unknown error |
| 400 | Wallet doesn't support TonProof |

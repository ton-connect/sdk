---
id: signData
name: Sign Data
summary: Sign data cryptographically without sending a blockchain transaction.
links:
  - title: Sign Data Spec
    url: https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md#sign-data
  - title: Sign Data Guide
    url: https://docs.tonconsole.com/academy/sign-data
---

## What it does

Sign Data requests a cryptographic signature from the wallet **without** sending any transaction to the blockchain. The wallet uses its Ed25519 private key to sign, proving ownership of the address.

## Data types

**Text** — Human-readable message
- Wallet shows the exact text to user
- Safest option — user sees what they sign

**Binary** — Raw bytes (Base64)
- Wallet shows a warning
- User cannot verify content
- Use for document hashes, file references

**Cell** — Structured blockchain data
- Requires TL-B schema for parsing
- Wallet can display structured content
- Use for on-chain contract verification

## Use cases

- **Authentication** — Prove wallet ownership after connection
- **Action confirmation** — Terms acceptance, critical operations
- **Vote delegation** — Sign voting data for on-chain verification
- **Off-chain messaging** — Signed messages without blockchain fees

## Security features

- **Timestamp** — Prevents replay attacks
- **Domain binding** — Signature tied to requesting domain
- **No fund access** — Signing grants no access to wallet funds

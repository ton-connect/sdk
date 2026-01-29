---
id: dataType
name: Data Type
summary: Format of data to sign.
links:
  - title: Sign Data Spec
    url: https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md#sign-data
  - title: Sign Data Guide
    url: https://docs.tonconsole.com/academy/sign-data
---

## Purpose

Sign data without sending transaction. Used for additional confirmations after wallet connect.

Wallet uses Ed25519 key (same as for transactions) but grants no fund access.

Use cases:
- Action confirmation (terms acceptance, critical operations)
- Vote delegation
- Data for on-chain contract verification

## Types

**text** — human-readable message
- Wallet shows text directly to user
- Safe — user sees exactly what they sign
- Best for: confirmations, agreements

**binary** — arbitrary bytes (Base64)
- Wallet shows warning (content not readable)
- User cannot verify what they sign
- Best for: document hashes, file references

**cell** — structured blockchain data (BOC + TL-B schema)
- Wallet parses using schema and displays structure
- If schema invalid → warning like binary
- Best for: on-chain contract validation

## Security

- **Timestamp** — prevents replay attacks
- **Domain binding** — prevents cross-site signature reuse
- **Address verification** — always verify response address matches expected wallet

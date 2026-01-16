---
id: tonproof
name: TonProof
summary: Cryptographic proof of wallet ownership using Ed25519 signature.
links:
  - title: TonProof Specification
    url: https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md#tonproof
  - title: Verification Guide
    url: https://docs.ton.org/v3/guidelines/ton-connect/guidelines/ton-proof
---

## Purpose

TonProof is a cryptographic challenge-response protocol that proves
user controls the wallet's private key.

## How it works

1. Backend generates random challenge (payload)
2. Wallet signs: `timestamp || domain || payload`
3. Backend verifies Ed25519 signature

## Signed message format

```
message = "ton-proof-item-v2/" ||
          Address ||
          AppDomain ||
          Timestamp ||
          Payload
```

## Security

- Timestamp prevents replay (15 min window)
- Domain binding prevents cross-site reuse
- Unique payload prevents replay attacks

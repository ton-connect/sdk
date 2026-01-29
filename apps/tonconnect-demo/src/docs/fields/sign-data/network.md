---
id: signDataNetwork
name: Network
summary: Target blockchain network for signature validation.
links:
  - title: Sign Data Spec
    url: https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md#sign-data
---

## Purpose

Restricts signing to a specific network (mainnet/testnet).
Prevents network mismatch attacks where a signature valid on testnet
could be misused on mainnet.

## Values

| Value | Network |
|-------|---------|
| `-239` | Mainnet |
| `-3` | Testnet |

## When to use

- Always specify when network matters for your use case
- Required for on-chain signature verification
- Prevents cross-network replay attacks

## Validation

If specified, wallet must be connected to matching network.
Wallet will reject if networks don't match.

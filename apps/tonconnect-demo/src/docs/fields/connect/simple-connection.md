---
id: simpleConnection
name: Simple Connection
summary: Connect wallet without cryptographic proof of ownership.
links:
  - title: TON Connect Overview
    url: https://docs.ton.org/ecosystem/ton-connect/overview
---

## Purpose

Simple connection establishes a link to user's wallet and retrieves their address.
No backend verification required — useful for read-only dApps.

## What you get

- Wallet address (raw format)
- Public key
- Network (mainnet/testnet)
- Wallet metadata (name, version, platform)

## Limitations

- No proof user controls the wallet
- Address could be spoofed in theory
- Not suitable for sensitive operations

## When to use

- Display wallet balance
- Show transaction history
- Read-only dashboards
- Non-critical operations

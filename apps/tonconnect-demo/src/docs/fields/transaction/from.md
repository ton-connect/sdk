---
id: from
name: From
summary: Sender address. Rarely needed.
---

## Default behavior

If not specified, uses the connected wallet's address. This is what you want in 99% of cases.

## When to specify

Reserved for advanced scenarios:
- Wallets managing multiple accounts internally
- Future multi-wallet connections

## In practice

Most DApps don't use this field. If you specify an address different from the connected wallet, the wallet will likely reject the request.

## Format

Raw: `0:abc123...` or user-friendly: `EQBxxx...`

---
id: stateInit
name: State Init
summary: Contract initialization for deployment.
links:
  - title: Contract Deployment
    url: https://docs.ton.org/foundations/status
---

## Purpose

StateInit deploys new contract to the blockchain. Contains:
- **code** — contract bytecode
- **data** — initial state

Contract address is derived from code + data. Same code + data = same address.

## Validation

**SDK level:**
- Must be valid Base64, start with `te6cc...`
- Error: `"Invalid 'stateInit' in message at index N"`

**Wallet level:**
- No specific requirements in TonConnect spec
- Wallet may or may not show deployment warning (implementation-dependent)
- Does NOT check if contract already exists

**Blockchain level:**
- If contract already deployed → transaction fails, gas consumed

## When to use

Only for new contract deployment. Not needed for regular transfers.

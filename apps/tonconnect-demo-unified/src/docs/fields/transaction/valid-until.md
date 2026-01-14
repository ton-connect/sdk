---
id: validUntil
name: Valid Until
summary: Unix timestamp (seconds) — deadline after which the transaction will be rejected.
links:
  - title: TonConnect Spec
    url: https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md
  - title: Wallet Contracts
    url: https://docs.ton.org/v3/documentation/smart-contracts/contracts-specs/wallet-contracts
---

## How it works

**Wallet app level:**
- Shows countdown until expiration
- May reject if expired before user confirmation
- Can override this value with a smaller one for security

**Blockchain level (smart contract):**
- Wallet v2+ checks `now() <= valid_until`
- If expired → **exit code 35**
- Protection against replay attacks together with seqno

## Recommended values

**5 minutes** is the standard.

- Shorter — time-sensitive conditions (DEX swaps, limited offers)
- Longer — user needs time to review complex transactions

**Note:** This only affects acceptance of the first external message. Once accepted, all internal messages execute regardless of this value.

## Technical details

- Type: `number` (Unix seconds, not ms!)
- Required field
- SDK warns if > 5 minutes

```ts
// Correct
validUntil: Math.floor(Date.now() / 1000) + 300

// Wrong (milliseconds!)
validUntil: Date.now() + 300000
```

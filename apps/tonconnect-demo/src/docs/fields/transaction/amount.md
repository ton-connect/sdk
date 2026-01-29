---
id: amount
name: Amount
summary: Transfer amount in nanotons.
links:
  - title: Transaction Fees
    url: https://docs.ton.org/contract-dev/gas
---

## Conversion

- 1 TON = 1,000,000,000 nano (10^9)
- 0.1 TON = 100,000,000 nano
- 0.001 TON = 1,000,000 nano

## Format

String with digits only (not a number!). This avoids JavaScript precision issues for large values.

```ts
// Correct
amount: "1000000000"

// Wrong
amount: 1000000000   // number
amount: "1.5"        // decimal
amount: "1e9"        // scientific
```

## What gets deducted

Each message has its own `amount` — TON attached to that message. Wallet deducts **sum of all amounts + wallet contract fee**.

Note: recipient may receive less than `amount` — part can be consumed by recipient contract execution or forwarded further.

## Zero amount

Valid for contract calls without TON transfer. Wallet contract fee still applies.

---
id: messages
name: Messages
summary: Array of outgoing messages. Min 1, max depends on wallet.
links:
  - title: Wallet Contracts
    url: https://docs.ton.org/standard/wallets/comparison
  - title: Transaction Fees
    url: https://docs.ton.org/contract-dev/gas
---

## Limits

**Minimum:** 1 message (required)

**Maximum:** returned by wallet at connection via `maxMessages`:
- Most wallets: **4 messages**
- Modern wallets: **up to 255**
- Some wallets/hardware devices: **1 message**

Always check actual value from connection — hardware devices may have stricter limits than their contract supports.

## Atomicity

Wallet should ensure all messages are sent or none. Messages are processed sequentially (1 → 2 → 3...).

If wallet doesn't verify gas beforehand, **later messages may not be sent** — no rollback for earlier ones.

## Use cases

- **DApp fee** — main action + service fee in one request
- **Batch transfers** — send to multiple recipients in one transaction

## Filtering wallets

If your DApp requires multiple messages, you can filter out unsupported wallets at connection time using `walletsRequiredFeatures` option.

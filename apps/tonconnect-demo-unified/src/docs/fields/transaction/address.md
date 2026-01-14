---
id: address
name: Address
summary: Recipient address in TON format.
links:
  - title: TON Addresses
    url: https://docs.ton.org/learn/overviews/addresses
---

## Format

Only **user-friendly** format accepted (Base64 with checksum).

Raw format (`0:abc...`) is valid for `from` field, but **not for message addresses**.

## Prefixes

| Prefix | Type | Network |
|--------|------|---------|
| `EQ` | bounceable | mainnet |
| `UQ` | non-bounceable | mainnet |
| `kQ` | bounceable | testnet |
| `0Q` | non-bounceable | testnet |

Masterchain: `Ef`, `Uf`, `kf`, `0f` — only for system contracts.

## Validation

SDK checks:
- **Checksum (CRC16)** — typo in any character fails validation
- **Workchain** — only 0 or -1

SDK does **not** verify testnet/mainnet match with `network` field — wallet handles this.

## Bounceable vs Non-bounceable

**Bounceable (EQ, kQ):**
- Contract doesn't exist → funds bounce back (minus gas)
- Use for: existing contracts

**Non-bounceable (UQ, 0Q):**
- Contract doesn't exist → account created, funds stay
- Use for: new accounts, exchange deposits

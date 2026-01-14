---
id: payload
name: Payload
summary: Message body sent to recipient contract.
links:
  - title: Cell & BoC
    url: https://docs.ton.org/develop/data-formats/cell-boc
---

## Purpose

Payload is Base64-encoded BOC (Bag of Cells) — message body delivered to recipient contract. Contract parses it and executes logic based on content.

First 32 bits are typically **op code** — tells contract what operation to perform. Rest is operation-specific data.

Without payload, contract receives empty message (just TON transfer).

## Validation

**SDK level:**
- Must be valid Base64
- Must start with `te6cc...` (BOC signature)
- Error: `"Invalid 'payload' in message at index N"`

**Contract level:**
- Parses cell structure
- Validates op code and parameters
- Can reject with exit code if malformed

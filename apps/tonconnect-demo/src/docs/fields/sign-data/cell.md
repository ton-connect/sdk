---
id: cell
name: Cell
summary: Structured blockchain data (BOC) for signing.
links:
  - title: Cell & BoC
    url: https://docs.ton.org/foundations/serialization/boc
---

Base64-encoded BOC (Bag of Cells). Requires TL-B schema for wallet to parse and display structure.

## Format
- Must start with `te6cc...`
- Must match the specified schema
- One root cell

If schema is valid — wallet shows parsed structure.
If schema invalid — wallet shows warning like binary type.

Use for: on-chain contract verification, structured data signing.

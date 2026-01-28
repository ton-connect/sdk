---
id: schema
name: Schema
summary: TL-B schema describing cell structure.
links:
  - title: TL-B Language
    url: https://docs.ton.org/languages/tl-b/overview
---

## Purpose

TL-B schema describes cell structure. Wallet uses it to parse and display data to user.

SDK validates that schema is non-empty string, but does NOT validate TL-B syntax.

## Format

```
TypeName#Selector field:Type = ResultType;
```

Examples:
- `message#_ text:string = Message;`
- `transfer#0f8a7ea5 amount:Coins dest:MsgAddress = Transfer;`

## If schema is invalid

Wallet shows "Unknown content" warning (like binary type). User can still sign, but won't see parsed data.

## Verification

Schema is hashed (CRC-32) during signing. Any change to schema string breaks signature verification.

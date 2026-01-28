---
id: payloadToken
name: Payload Token
summary: Implementation-specific token for stateless challenge verification.
---

## Purpose

Payload token is this demo's approach to stateless backend verification.
Your implementation may differ.

## This demo's approach

- JWT containing random bytes + expiration
- SHA256 hash sent to wallet as challenge
- On verification: JWT signature proves authenticity

## Token structure

```json
{
  "payload": "<random_bytes>",
  "exp": 1234567890
}
```

## Alternatives

- Database-stored nonces
- Redis cache with TTL
- Session-based storage

## Why JWT?

- Stateless — no database required
- Self-contained expiration
- Cryptographically secure
- Easy to verify authenticity

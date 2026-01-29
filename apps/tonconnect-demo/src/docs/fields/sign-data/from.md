---
id: signDataFrom
name: From Address
summary: Restrict which wallet address can sign.
links:
  - title: Sign Data Spec
    url: https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md#sign-data
---

## Purpose

Specifies expected signer address. Prevents address substitution attacks
where user switches to different wallet mid-session.

## Format

Raw TON address format:
```
0:abc123...def456
```

## When to use

- Multi-wallet scenarios
- After verifying specific wallet ownership
- When signature must come from known address

## Validation

If specified, wallet must use matching address.
Request fails if connected wallet doesn't match.

## Security

Always verify `response.address` matches expected address,
even if you specified `from` parameter — defense in depth.

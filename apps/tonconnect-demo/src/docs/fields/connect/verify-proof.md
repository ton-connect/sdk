---
id: verifyProof
name: Verify Proof
summary: Backend cryptographic verification of wallet signature.
links:
  - title: TonProof Specification
    url: https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md#address-proof-signature-ton_proof
---

## What happens

Frontend sends proof from Step 2 to your backend. Backend verifies the Ed25519 signature and all supporting data.

## What to verify

All must pass: public key matches StateInit, address is correct hash, domain is whitelisted, timestamp is fresh (15 min), payload matches your challenge, signature is valid.

## Signature formula

```
message = "ton-proof-item-v2/" || address || domain || timestamp || payload
fullMessage = 0xffff || "ton-connect" || sha256(message)
valid = ed25519.verify(signature, sha256(fullMessage), publicKey)
```

## On success

Issue auth token (JWT, session, cookie) for subsequent API calls. User is now authenticated.

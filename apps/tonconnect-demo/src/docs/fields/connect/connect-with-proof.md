---
id: connectWithProof
name: Connect with Proof
summary: Open wallet modal requesting TonProof signature.
links:
  - title: Protocol Spec
    url: https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md
---

## What happens

Wallet modal opens with connection + signature request. User approves → wallet signs the challenge from Step 1.

## Key constraint

**Proof can only be requested at connection time.**

Already connected? Disconnect first, then reconnect with proof. Cannot add proof to existing connection.

## What you receive

| Field | Description |
|-------|-------------|
| `account.address` | Wallet address (raw format) |
| `account.publicKey` | Ed25519 public key |
| `tonProof.proof.timestamp` | When signature was created |
| `tonProof.proof.domain` | Domain that requested proof |
| `tonProof.proof.payload` | Your original challenge |
| `tonProof.proof.signature` | Base64 Ed25519 signature |
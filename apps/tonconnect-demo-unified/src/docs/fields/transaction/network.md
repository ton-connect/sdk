---
id: network
name: Network
summary: TON workchain ID where the transaction should be sent.
links:
  - title: TonConnect Spec
    url: https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md
---

## Values

- `-239` — mainnet
- `-3` — testnet

These are TON workchain IDs (not chain IDs like in Ethereum).

## How validation works

**SDK level:**
- Compares with wallet's connected network
- Throws `WalletWrongNetworkError` on mismatch

**Wallet level:**
- Must show alert on mismatch
- Must NOT allow sending to wrong network

## If not specified

Falls back to wallet's current network. The official spec explicitly states this is **unsafe** — always set the network explicitly.

## Setting at connection time

```ts
// Enforce network before connecting
tonConnectUI.setConnectionNetwork(CHAIN.MAINNET)
```

If wallet connects with different network → connection rejected.

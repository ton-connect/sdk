---
id: transaction
name: Transaction Request
summary: Request the connected wallet to sign and broadcast a transaction to the TON blockchain.
links:
  - title: Sending Messages Guide
    url: https://docs.ton.org/ecosystem/ton-connect/dapp
  - title: Protocol Spec
    url: https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md#sign-and-send-transaction
---

## What it does

A Transaction Request instructs the connected wallet to:
1. Build an external message with your specified parameters
2. Sign it with the wallet's private key
3. Broadcast it to the TON blockchain

## Message structure

Each transaction contains one or more **messages**. Each message specifies:
- **Address** — recipient smart contract or wallet
- **Amount** — TON to attach (in nanotons)
- **Payload** — optional data for smart contract calls
- **State Init** — optional code for contract deployment

## Flow

```
DApp → Wallet → Blockchain
          ↓
        DApp (result BOC)
```

1. DApp sends transaction request via TonConnect
2. Wallet shows confirmation UI to user
3. User approves → wallet signs and broadcasts to blockchain
4. Wallet returns signed BOC (base64) to DApp

## Result handling

- **Success** — Wallet returns `{ result: "<boc_base64>" }`
- **User rejected** — Error with code `300`
- **Timeout** — Error with code `400`

## Common use cases

- Transfer TON between wallets
- Call smart contract methods (Jetton transfers, NFT operations)
- Deploy new contracts
- Batch multiple operations in one transaction

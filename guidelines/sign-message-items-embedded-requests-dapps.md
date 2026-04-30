# DApp Developer Guide: New TON Connect Features

This guide covers three new SDK capabilities for dApps built with `@tonconnect/ui` or `@tonconnect/ui-react`. Each section is self-contained.

| Feature                                   | What it does                                           |
|-------------------------------------------|--------------------------------------------------------|
| [Sign Message](#1-sign-message)           | Get a signed internal message BoC without broadcasting |
| [Structured Items](#2-structured-items)   | Describe transfers at a high level — wallet builds BoC |
| [Embedded Requests](#3-embedded-requests) | Connect + action in a single tap (mobile)              |

---

## 1. Sign Message

### What is it

`signMessage` asks the wallet to **sign** an internal message using the Wallet V5 `internal_signed` opcode but **not broadcast** it to the network. The signed BoC is returned to the dApp, which can submit it through a relayer (e.g. gasless transactions).

The request payload has the **same shape** as `sendTransaction` — it supports both raw `messages` and structured `items`.

### Basic usage

```typescript
import { TonConnectUI } from '@tonconnect/ui';
// or: import { useTonConnectUI } from '@tonconnect/ui-react';

const result = await tonConnectUi.signMessage({
    validUntil: Math.floor(Date.now() / 1000) + 300,
    network: '-239', // mainnet; use '-3' for testnet
    messages: [
        {
            address: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
            amount: '5000000',
            payload: bodyBoc,    // optional, base64
            stateInit: initBoc,  // optional, base64
        }
    ]
});

const signedBoc = result.internalBoc; // base64-encoded signed internal message
```

### Response

```typescript
interface SignMessageResponse {
    internalBoc: string; // base64 signed internal message BoC
}
```

### Use case: gasless transactions

The most common use case is gasless (sponsored) transactions using a relayer such as [TonAPI Gasless](https://docs.tonconsole.com/tonapi/rest-api/gasless). The relay fee is paid in the same jetton, so the user never needs to hold TON for gas.

The flow is:

1. Resolve the user's jetton wallet address on-chain
2. Build the jetton transfer cell to pass to the estimator
3. Call `gaslessEstimate` — the relayer returns the exact messages to sign (main transfer + relay fee)
4. Call `signMessage` with those messages — wallet signs but does not broadcast
5. Wrap the signed BoC in an external message and submit via `gaslessSend`

The underlying REST endpoints are documented at [docs.tonconsole.com/tonapi/rest-api/gasless](https://docs.tonconsole.com/tonapi/rest-api/gasless).

```typescript
import {
    Address,
    beginCell,
    Cell,
    external,
    internal,
    loadMessageRelaxed,
    storeMessage,
    storeMessageRelaxed,
    toNano
} from '@ton/core';
import { TonApiClient } from '@ton-api/client';
import { TonConnectUI } from '@tonconnect/ui';

const ta = new TonApiClient({ baseUrl: 'https://tonapi.io' });

const JETTON_TRANSFER_OP = 0xf8a7ea5;
const BASE_JETTON_SEND_AMOUNT = toNano(0.05); // attached TON for the jetton transfer message

/**
 * Sends a jetton transfer without the user holding TON for gas.
 */
export async function sendGaslessJettonTransfer(
    tonConnectUi: TonConnectUI,
    jettonMaster: Address,
    destination: Address,
    jettonAmount: bigint,
): Promise<void> {
    if (!tonConnectUi.wallet?.account?.address || !tonConnectUi.wallet?.account?.publicKey) {
        throw new Error('No wallet connected.');
    }
    const walletAddress = Address.parse(tonConnectUi.wallet.account.address);
    const walletPublicKey = tonConnectUi.wallet.account.publicKey;

    // 1. Resolve the user's jetton wallet address
    const result = await ta.blockchain.execGetMethodForBlockchainAccount(
        jettonMaster,
        'get_wallet_address',
        { args: [walletAddress.toString()] }
    );
    const jettonWallet = Address.parse(result.decoded.jetton_wallet_address);

    // 2. Build the jetton transfer cell
    //    This is passed to the estimator so it can calculate the exact relay fee.
    //    The relayer's address is used as responseDestination so excess is returned to it.
    const cfg = await ta.gasless.gaslessConfig();
    const relayAddress = cfg.relayAddress;

    const transferBody = beginCell()
        .storeUint(JETTON_TRANSFER_OP, 32)
        .storeUint(0, 64)          // query_id
        .storeCoins(jettonAmount)
        .storeAddress(destination)
        .storeAddress(relayAddress) // response_destination — excess goes to relayer
        .storeBit(false)            // no custom payload
        .storeCoins(1n)             // forward_amount
        .storeMaybeRef(undefined)   // no forward payload
        .endCell();

    const messageToEstimate = beginCell()
        .storeWritable(storeMessageRelaxed(internal({
            to: jettonWallet,
            bounce: true,
            value: BASE_JETTON_SEND_AMOUNT,
            body: transferBody,
        })))
        .endCell();

    // 3. Estimate relay fee — returns the exact list of messages to sign
    const params = await ta.gasless.gaslessEstimate(jettonMaster, {
        walletAddress,
        walletPublicKey,
        messages: [{ boc: messageToEstimate }],
    });

    // 4. Sign (without broadcasting) using the messages returned by the estimator
    const { internalBoc } = await tonConnectUi.signMessage({
        validUntil: Math.ceil(Date.now() / 1000) + 5 * 60,
        messages: params.messages.map(msg => ({
            address: msg.address.toString(),
            amount: msg.amount,
            payload: msg.payload?.toBoc()?.toString('base64'),
            stateInit: msg.stateInit?.toBoc()?.toString('base64'),
        })),
    });

    // 5. Wrap the signed internal message in an external message
    const { info: { dest }, body, init } = loadMessageRelaxed(
        Cell.fromBase64(internalBoc).beginParse()
    );
    const extMessage = beginCell()
        .storeWritable(storeMessage(external({ to: dest as Address, init, body })))
        .endCell();

    // 6. Submit to the TonAPI gasless relayer
    await ta.gasless.gaslessSend({
        walletPublicKey,
        boc: extMessage,
    });
}
```

### Error handling

The wallet may return these errors:

| Code | Description               |
|------|---------------------------|
| 0    | Unknown error             |
| 1    | Bad request               |
| 100  | Unknown app               |
| 300  | User declined the request |
| 400  | Method not supported      |

If the connected wallet does not support `SignMessage`, the SDK throws a `TonConnectError` before sending the request. Wrap calls in try/catch:

```typescript
import { TonConnectUI, TonConnectError } from '@tonconnect/ui';

try {
    const result = await tonConnectUi.signMessage(request);
} catch (e) {
    if (e instanceof TonConnectError) {
        console.error('signMessage not supported or failed:', e.message);
    }
}
```

---

## 2. Structured Items

### What is it

Structured items let you describe **what** you want to do (send TON, transfer a jetton, transfer an NFT) instead of constructing raw BoC messages yourself. The wallet handles BoC construction — resolving jetton wallet addresses, building transfer cells, and estimating gas.

Both `sendTransaction` and `signMessage` accept an `items` array as an alternative to `messages`.

### Request format

A request must contain either `messages` or `items`, never both:

```typescript
// Using raw messages (existing approach)
await tonConnectUi.sendTransaction({
    validUntil: Math.floor(Date.now() / 1000) + 600,
    network: '-239',
    messages: [{ address, amount, payload, stateInit }]
});

// Using structured items (new approach)
await tonConnectUi.sendTransaction({
    validUntil: Math.floor(Date.now() / 1000) + 600,
    network: '-239',
    items: [{ type: 'ton', address, amount, payload, stateInit }]
});
```

### Item types

All types below are importable from `@tonconnect/ui` or `@tonconnect/ui-react`:

```typescript
import { TonItem, JettonItem, NftItem, StructuredItem } from '@tonconnect/ui-react';
// StructuredItem = TonItem | JettonItem | NftItem
```

**TonItem** — simple TON transfer:

```typescript
interface TonItem {
    type: 'ton';
    address: string;       // destination in friendly format
    amount: string;        // nanocoins as decimal string
    payload?: string;      // optional body, raw one-cell BoC in Base64
    stateInit?: string;    // optional, raw one-cell BoC in Base64
    extra_currency?: { [k: number]: string };
}
```

**JettonItem** — fungible token transfer:

```typescript
interface JettonItem {
    type: 'jetton';
    master: string;               // jetton master contract address
    destination: string;          // recipient address
    amount: string;               // jetton amount in elementary units
    attachAmount?: string;        // TON to attach for fees (wallet estimates if omitted)
    responseDestination?: string; // where to send excess (defaults to sender)
    customPayload?: string;       // raw one-cell BoC in Base64
    forwardAmount?: string;       // nanotons to forward to destination
    forwardPayload?: string;      // raw one-cell BoC in Base64
    queryId?: string;             // custom query ID
}
```

**NftItem** — NFT transfer:

```typescript
interface NftItem {
    type: 'nft';
    nftAddress: string;           // NFT item contract address
    newOwner: string;             // new owner address
    attachAmount?: string;        // TON to attach for fees (wallet estimates if omitted)
    responseDestination?: string; // where to send excess (defaults to sender)
    customPayload?: string;       // raw one-cell BoC in Base64
    forwardAmount?: string;       // nanotons to forward to new owner
    forwardPayload?: string;      // raw one-cell BoC in Base64
    queryId?: string;             // custom query ID
}
```

### Examples

**Send TON:**

```typescript
await tonConnectUi.sendTransaction({
    validUntil: Math.floor(Date.now() / 1000) + 600,
    network: '-239',
    items: [
        {
            type: 'ton',
            address: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
            amount: '5000000',
        }
    ]
});
```

**Transfer jettons:**

```typescript
await tonConnectUi.sendTransaction({
    validUntil: Math.floor(Date.now() / 1000) + 600,
    network: '-239',
    items: [
        {
            type: 'jetton',
            master: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs', // USDt
            amount: '1000000',
            destination: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
        }
    ]
});
```

**Transfer an NFT:**

```typescript
await tonConnectUi.sendTransaction({
    validUntil: Math.floor(Date.now() / 1000) + 600,
    network: '-239',
    items: [
        {
            type: 'nft',
            nftAddress: 'EQAcoW_B0vxbiLxdZGoz500BoFqjmNi5jA6w2nxwuqD8qM3T',
            newOwner: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
        }
    ]
});
```

**Mix TON and jetton in one transaction:**

```typescript
await tonConnectUi.sendTransaction({
    validUntil: Math.floor(Date.now() / 1000) + 600,
    network: '-239',
    items: [
        {
            type: 'ton',
            address: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
            amount: '5000000',
        },
        {
            type: 'jetton',
            master: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
            amount: '50000',
            destination: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
        }
    ]
});
```

**Sign (not send) structured items:**

```typescript
const { internalBoc } = await tonConnectUi.signMessage({
    validUntil: Math.ceil(Date.now() / 1000) + 5 * 60,
    network: '-239',
    items: [
        {
            type: 'jetton',
            master: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
            amount: '1000000',
            destination: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
            forwardAmount: '1',
        }
    ]
});
```

### When to use items vs messages

| Use `items` when                                  | Use `messages` when                         |
|---------------------------------------------------|---------------------------------------------|
| You want the wallet to handle BoC construction    | You need full control over the cell payload |
| You don't want to resolve jetton wallet addresses | The contract uses a custom op code          |

---

## 3. Embedded Requests

### What is it

Embedded requests let you call `sendTransaction`, `signMessage`, or `signData` **before the user is connected**. The SDK includes the embedded request in the wallet's deep link URL so the wallet handles **connection and action in a single tap**.

This feature works on **mobile only** (universal links / deep links). It eliminates a round-trip for common flows like "connect and pay".

### How it works

1. The dApp calls `sendTransaction` (or `signMessage` / `signData`) with the `onConnected` callback
2. The SDK opens the wallet selection modal
3. The embedded request is passed in the wallet's universal link as an `e` URL parameter
4. The user taps the link → the wallet opens with both the connect request and the action
5. The wallet presents the connection and the action to the user (UX is up to the wallet)
6. The result comes back either as part of the connect event or via the bridge after connection

If the wallet supports `EmbeddedRequest`, the result comes back immediately as part of the connect event and the promise resolves — `onConnected` is never called.

If the wallet does not support `EmbeddedRequest` (or the response is missing), `onConnected` is called after the wallet connects, giving you a chance to verify and send the request over the bridge.

### Basic usage

The `onConnected` callback is called when the wallet connects. It receives:

- `send` — a function that re-sends the request over the bridge (standard two-step flow)
- `context.dispatched` — `true` if the embedded request was already included in the connect URL

> **Warning: always check `dispatched` before calling `send()`.**
>
> When `dispatched` is `true`, the embedded request was sent inside the connect URL. The wallet may have already executed it — but the response may not have reached the dApp (network error, app backgrounded, deep-link race). Calling `send()` unconditionally in that case will submit the transaction a **second time**.
>
> Always verify on-chain first:
>
> ```typescript
> const result = await tonConnectUi.sendTransaction(tx, {
>     onConnected: async (send, { dispatched }) => {
>         if (dispatched) {
>             // The wallet may have already executed the request — verify before retrying.
>             const onchainTx = getOnchainTransaction(tx);
>             if (onchainTx) {
>                 return { boc: onchainTx.boc };
>             }
>         }
>         return send();
>     }
> });
> ```

### Complete React example

```typescript jsx
import { useState } from 'react';
import { useTonConnectUI, SendTransactionRequest } from '@tonconnect/ui-react';

const tx: SendTransactionRequest = {
    validUntil: Math.floor(Date.now() / 1000) + 600,
    network: '-239',
    items: [
        {
            type: 'ton',
            address: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
            amount: '5000000'
        }
    ]
};

function PayButton() {
    const [tonConnectUi] = useTonConnectUI();
    const [loading, setLoading] = useState(false);

    const handlePay = async () => {
        setLoading(true);
        try {
            const result = await tonConnectUi.sendTransaction(tx, {
                onConnected: async (send, { dispatched }) => {
                    if (dispatched) {
                        // The embedded request was included in the connect URL but TON Connect did not
                        // receive a response — the wallet may have already executed it.
                        // Verify on-chain before retrying to avoid a duplicate transaction.
                        const onchainTx = getOnchainTransaction(tx);
                        if (onchainTx) {
                            return { boc: onchainTx.boc };
                        }
                    }
                    return send();
                }
            });
            console.log('Transaction sent:', result.boc);
        } catch (e) {
            console.error('Transaction failed:', e);
        } finally {
            setLoading(false);
        }
    };

    // Button is always visible — works both connected and disconnected.
    // If disconnected, the SDK opens the wallet modal first.
    return (
        <button onClick={handlePay} disabled={loading}>
            {loading ? 'Processing...' : 'Pay 0.005 TON'}
        </button>
    );
}
```

### Works with all request types

The `onConnected` pattern is the same for `sendTransaction`, `signMessage`, and `signData`.

### How the SDK decides whether to embed

The SDK includes an embedded request only when:

1. The wallet is not yet connected
2. `onConnected` is provided in options
3. The embedded request payload fits within URL size limits (if too large, the SDK omits it and falls back)

If the embedded request is too large for the URL, the SDK still connects normally and then calls `onConnected` with `dispatched: false`.

### Backward compatibility

| Scenario                                         | Behavior                                                    |
|--------------------------------------------------|-------------------------------------------------------------|
| Wallet supports `EmbeddedRequest`                | Result returned immediately after connect                   |
| Wallet ignores `e` param                         | `onConnected` called with `dispatched: true`                |
| `onConnected` not provided + wallet disconnected | SDK throws `TonConnectUIError`                              |
| Request too large for URL                        | `onConnected` called with `dispatched: false` after connect |

---

## Filtering Wallets by Features

You can filter the wallet list to only show wallets that support the features your dApp needs.

**With `TonConnectUI`:**

```typescript
import { TonConnectUI } from '@tonconnect/ui';

const tonConnectUi = new TonConnectUI({
    manifestUrl: 'https://example.com/tonconnect-manifest.json',
    walletsRequiredFeatures: {
        sendTransaction: {
            itemTypes: ['ton', 'jetton'],
        },
        signMessage: {
            minMessages: 1,
        },
    }
});
```

**With `TonConnectUIProvider` (React):**

```tsx
import { TonConnectUIProvider } from '@tonconnect/ui-react';

function App() {
    return (
        <TonConnectUIProvider
            manifestUrl="https://example.com/tonconnect-manifest.json"
            walletsRequiredFeatures={{
                sendTransaction: {
                    itemTypes: ['ton', 'jetton'],
                },
                signMessage: {
                    minMessages: 1,
                },
            }}
        >
            {/* your app */}
        </TonConnectUIProvider>
    );
}
```

Only wallets supporting all specified features will appear in the modal. The full type:

```typescript
type RequiredFeatures = {
    sendTransaction?: {
        minMessages?: number;            // wallet must support at least this many messages
        extraCurrencyRequired?: boolean; // wallet must support extra currencies
        itemTypes?: ('ton' | 'jetton' | 'nft')[]; // wallet must support these item types
    };
    signData?: {
        types: ('text' | 'binary' | 'cell')[]; // wallet must support these sign data types
    };
    signMessage?: {
        minMessages?: number;
        extraCurrencyRequired?: boolean;
        itemTypes?: ('ton' | 'jetton' | 'nft')[];
    };
    embeddedRequest?: {}; // wallet must support the EmbeddedRequest feature
};
```

---

## See Also

- [Wallet Integration Guide](./sign-message-items-embedded-requests-wallets.md) — how wallets implement these features
- [Requests and Responses spec](https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md) — full protocol definition
- [Wallets List](https://github.com/ton-blockchain/wallets-list) — registry of TON Connect wallets

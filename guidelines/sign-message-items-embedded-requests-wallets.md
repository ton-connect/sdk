# Wallet Integration Guide: New TON Connect Features

This guide covers three new protocol extensions for TON Connect wallets. Each section is self-contained — implement them independently or together.

| Feature                                   | What it does                                                | Effort |
|-------------------------------------------|-------------------------------------------------------------|--------|
| [Sign Message](#1-sign-message)           | New RPC method: sign without broadcast                      | Small  |
| [Structured Items](#2-structured-items)   | High-level `items` field in sendTransaction and signMessage | Small  |
| [Embedded Requests](#3-embedded-requests) | Embed an RPC request in the connect URL (mobile)            | Medium |

---

## 1. Sign Message

### What is it

`signMessage` is a new RPC method alongside the existing `sendTransaction` and `signData`. It asks the wallet to **sign** an internal message but **not broadcast** it to the network. The signed BoC is returned to the dApp, which can then submit it through a relayer (e.g. gasless transactions or custom relayer).

### Protocol wire format

The request uses the standard `AppRequest` structure:

```json
{
  "method": "signMessage",
  "params": [
    "<transaction-payload JSON string>"
  ],
  "id": "42"
}
```

The `<transaction-payload>` has the **same structure** as `sendTransaction` — it supports `messages` (raw BoC), `items` (structured items), `valid_until`, `network`, and `from`.

The response returns the signed internal message:

```json
{
  "result": {
    "internalBoc": "<base64 signed internal message BoC>"
  },
  "id": "42"
}
```

The wallet MUST construct each outgoing message with **send mode 3** (`PAY_GAS_SEPARATELY + IGNORE_ERRORS`).

### Error codes

| Code | Description               |
|------|---------------------------|
| 0    | Unknown error             |
| 1    | Bad request               |
| 100  | Unknown app               |
| 300  | User declined the request |
| 400  | Method not supported      |

### How to implement

The implementation reuses 90% of your existing `sendTransaction` logic. The key differences are: **skip the broadcast step**, **use `internal_signed` opcode**, and return the signed BoC directly.

#### Step 1: Add the feature

When the wallet connects, include `SignMessage` in the `features` array of `DeviceInfo`:

```typescript
const deviceInfo: DeviceInfo = {
    platform: 'iphone',
    appName: 'MyWallet',
    appVersion: '3.0.0',
    maxProtocolVersion: 2,
    features: [
        {
            name: 'SendTransaction',
            maxMessages: 255,
            extraCurrencySupported: true,
        },
        {
            name: 'SignMessage',
            maxMessages: 255,
            extraCurrencySupported: true,
        }
    ]
};
```

The `SignMessage` feature object has the same shape as `SendTransaction`:

```typescript
type SignMessageFeature = {
    name: 'SignMessage';
    maxMessages: number;
    extraCurrencySupported?: boolean;
    itemTypes?: ('ton' | 'jetton' | 'nft')[]; // only if structured items are supported
};
```

#### Step 2: Handle the RPC request

When a `signMessage` request arrives, process it identically to `sendTransaction` but skip broadcasting and use `internal_signed` opcode 0x73696e74:

```typescript
async function handleSignMessage(request: AppRequest): Promise<WalletResponse> {
    const payload = JSON.parse(request.params[0]);
    validateTransactionPayload(payload);

    // Build outgoing messages — reuse the same logic as sendTransaction.
    // Supports both raw `messages` and structured `items`.
    // walletAddress is the connected wallet's address (available in your wallet context).
    const outMessages = await processTransactionPayload(payload, walletAddress);

    const approved = await showSignConfirmation(outMessages);
    if (!approved) {
        return { error: { code: 300, message: 'User declined the request' }, id: request.id };
    }

    // For Wallet V5: use `internal_signed` opcode (0x73696e74) so a relayer
    // can submit this as an internal message. DO NOT broadcast to the network.
    const signedBoc = buildWalletV5InternalSigned(outMessages, payload);

    return { result: { internalBoc: signedBoc }, id: request.id };
}
```

#### Routing the request

Add `signMessage` to your existing RPC method router:

```typescript
async function handleAppRequest(request: AppRequest): Promise<WalletResponse> {
    switch (request.method) {
        case 'sendTransaction':
            return handleSendTransaction(request);
        case 'signMessage':
            return handleSignMessage(request);
        case 'signData':
            return handleSignData(request);
        case 'disconnect':
            return handleDisconnect(request);
        default:
            return { error: { code: 400, message: 'Method not supported' }, id: request.id };
    }
}
```

---

## 2. Structured Items

### What is it

Structured items introduce a new `items` field as an alternative to the existing `messages` field in both `sendTransaction` and `signMessage` requests. Instead of requiring dApps to construct raw BoC payloads for Jetton/NFT transfers, they describe **what** the user wants to do at a high level, and the **wallet** constructs the BoC.

A request payload MUST contain either `messages` or `items`, never both. If a request contains both, the wallet MUST reject it with error code 1 (Bad request).

Three item types are defined:

| Type     | Description                      |
|----------|----------------------------------|
| `ton`    | Simple TON transfer              |
| `jetton` | Jetton (fungible token) transfer |
| `nft`    | NFT transfer                     |

### Protocol format

The `items` array replaces `messages` in the JSON payload:

```json
{
  "valid_until": 1764424242,
  "network": "-239",
  "items": [
    {
      "type": "jetton",
      "master": "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
      "destination": "UQAAAAA...AAJKZ",
      "amount": "1000000",
      "forwardAmount": "10000000"
    }
  ]
}
```

### Item type definitions

**TonItem** — simple TON transfer:

| Field            | Type    | Required | Description                         |
|------------------|---------|----------|-------------------------------------|
| `type`           | `"ton"` | yes      | Item discriminator                  |
| `address`        | string  | yes      | Destination in user-friendly format |
| `amount`         | string  | yes      | Nanocoins as decimal string         |
| `payload`        | string  | no       | Raw one-cell BoC in Base64          |
| `stateInit`      | string  | no       | Raw one-cell BoC in Base64          |
| `extra_currency` | object  | no       | Extra currencies to send            |

**JettonItem** — Jetton transfer:

| Field                  | Type       | Required | Description                                          |
|------------------------|------------|----------|------------------------------------------------------|
| `type`                 | `"jetton"` | yes      | Item discriminator                                   |
| `master`               | string     | yes      | Jetton master contract address                       |
| `destination`          | string     | yes      | Recipient address                                    |
| `amount`               | string     | yes      | Jetton amount in elementary units                    |
| `attachAmount`         | string     | no       | TON to attach for fees; wallet calculates if omitted |
| `queryId`              | string     | no       | Custom query ID                             |
| `responseDestination`  | string     | no       | Where to send excess; defaults to sender             |
| `customPayload`        | string     | no       | Raw one-cell BoC in Base64                           |
| `forwardAmount`        | string     | no       | Nanotons to forward to destination                   |
| `forwardPayload`       | string     | no       | Raw one-cell BoC in Base64                           |

**NftItem** — NFT transfer:

| Field                  | Type    | Required | Description                                          |
|------------------------|---------|----------|------------------------------------------------------|
| `type`                 | `"nft"` | yes      | Item discriminator                                   |
| `nftAddress`           | string  | yes      | NFT item contract address                            |
| `newOwner`             | string  | yes      | New owner address                                    |
| `attachAmount`         | string  | no       | TON to attach for fees; wallet calculates if omitted |
| `queryId`              | string  | no       | Custom query ID                             |
| `responseDestination`  | string  | no       | Where to send excess; defaults to sender             |
| `customPayload`        | string  | no       | Raw one-cell BoC in Base64                           |
| `forwardAmount`        | string  | no       | Nanotons to forward to destination                   |
| `forwardPayload`       | string  | no       | Raw one-cell BoC in Base64                           |

### How to implement

#### Step 1: Include supported item types

Add `itemTypes` to the `SendTransaction` feature (and `SignMessage` if supported):

```typescript
const features: Feature[] = [
    {
        name: 'SendTransaction',
        maxMessages: 4,
        extraCurrencySupported: true,
        itemTypes: ['ton', 'jetton', 'nft']  // NEW: declare supported item types
    },
    {
        name: 'SignMessage',
        maxMessages: 4,
        itemTypes: ['ton', 'jetton', 'nft']  // NEW: same for signMessage
    }
];
```

If `itemTypes` is absent, the SDK treats the wallet as supporting only raw `messages`. Only include item types your wallet actually supports.

#### Step 2: Validate the payload

When receiving a `sendTransaction` or `signMessage` request, check for mutual exclusivity:

```typescript
function validateTransactionPayload(payload: TransactionPayload): void {
    // ... other validation logic 

    const hasMessages = Array.isArray(payload.messages) && payload.messages.length > 0;
    const hasItems = Array.isArray(payload.items) && payload.items.length > 0;

    if (hasMessages && hasItems) {
        throw new BadRequestError('Payload must contain either "messages" or "items", not both');
    }

    if (!hasMessages && !hasItems) {
        throw new BadRequestError('Payload must contain "messages" or "items"');
    }
}
```

#### Step 3: Build BoC from structured items

For each item in the `items` array, the wallet constructs the appropriate outgoing message. The user's connected address is used as the sender.

**TON transfer** — straightforward, same as a message:

```typescript
import { Address, beginCell, Cell, internal, loadStateInit } from '@ton/core';

function buildTonTransferMessage(item: TonItem): MessageRelaxed {
    return internal({
        to: Address.parse(item.address),
        value: BigInt(item.amount),
        body: item.payload ? Cell.fromBase64(item.payload) : undefined,
        init: item.stateInit
            ? loadStateInit(Cell.fromBase64(item.stateInit).asSlice())
            : undefined,
        bounce: Address.isFriendly(item.address)
            ? Address.parseFriendly(item.address).isBounceable
            : true,
    });
}
```

**Jetton transfer** — the wallet must resolve the jetton wallet address and build the `transfer#0f8a7ea5` cell:

```typescript
import { Address, beginCell, Cell, internal } from '@ton/core';

async function buildJettonTransferMessage(
    item: JettonItem,
    walletAddress: Address
): Promise<MessageRelaxed> {
    const jettonWalletAddress = await resolveJettonWallet(
        Address.parse(item.master), walletAddress
    );

    const queryId = item.queryId ? BigInt(item.queryId) : 0n;
    const destination = Address.parse(item.destination);
    const responseDestination = item.responseDestination
        ? Address.parse(item.responseDestination)
        : walletAddress;
    const customPayload = item.customPayload
        ? Cell.fromBase64(item.customPayload)
        : null;
    const forwardAmount = item.forwardAmount ? BigInt(item.forwardAmount) : 0n;

    // transfer#0f8a7ea5
    // TL-B: forward_payload:(Either Cell ^Cell) — bit 0 = inline slice, bit 1 = ref
    const builder = beginCell()
        .storeUint(0x0f8a7ea5, 32)
        .storeUint(queryId, 64)
        .storeCoins(BigInt(item.amount))
        .storeAddress(destination)
        .storeAddress(responseDestination)
        .storeMaybeRef(customPayload)
        .storeCoins(forwardAmount);

    if (item.forwardPayload) {
        const fwdCell = Cell.fromBase64(item.forwardPayload);
        builder.storeUint(1, 1).storeRef(fwdCell); // Either right branch: 1 + ^Cell
    } else {
        builder.storeUint(0, 1); // Either left branch: empty
    }

    const body = builder.endCell();

    const attachAmount = item.attachAmount
        ? BigInt(item.attachAmount)
        : estimateJettonTransferGas(item);

    return internal({
        to: jettonWalletAddress,
        value: attachAmount,
        body,
        bounce: true,
    });
}
```

**NFT transfer** — similar pattern with `transfer#5fcc3d14`:

```typescript
async function buildNftTransferMessage(
    item: NftItem,
    walletAddress: Address
): Promise<MessageRelaxed> {
    const queryId = item.queryId ? BigInt(item.queryId) : 0n;
    const newOwner = Address.parse(item.newOwner);
    const responseDestination = item.responseDestination
        ? Address.parse(item.responseDestination)
        : walletAddress;
    const customPayload = item.customPayload
        ? Cell.fromBase64(item.customPayload)
        : null;
    const forwardAmount = item.forwardAmount ? BigInt(item.forwardAmount) : 0n;

    // transfer#5fcc3d14
    // TL-B: forward_payload:(Either Cell ^Cell) — bit 0 = inline slice, bit 1 = ref
    const builder = beginCell()
        .storeUint(0x5fcc3d14, 32)
        .storeUint(queryId, 64)
        .storeAddress(newOwner)
        .storeAddress(responseDestination)
        .storeMaybeRef(customPayload)
        .storeCoins(forwardAmount);

    if (item.forwardPayload) {
        const fwdCell = Cell.fromBase64(item.forwardPayload);
        builder.storeUint(1, 1).storeRef(fwdCell); // Either right branch: 1 + ^Cell
    } else {
        builder.storeUint(0, 1); // Either left branch: empty
    }

    const body = builder.endCell();

    const attachAmount = item.attachAmount
        ? BigInt(item.attachAmount)
        : estimateNftTransferGas();

    return internal({
        to: Address.parse(item.nftAddress),
        value: attachAmount,
        body,
        bounce: true,
    });
}
```

#### Step 4: Dispatch in transaction handler

Update your transaction handler to route between `messages` and `items`:

```typescript
async function processTransactionPayload(
    payload: TransactionPayload,
    walletAddress: Address
): Promise<MessageRelaxed[]> {
    if (payload.items) {
        return Promise.all(
            payload.items.map(item => buildMessageFromItem(item, walletAddress))
        );
    }

    // Existing raw message handling
    return payload.messages.map(msg => buildMessageFromRaw(msg));
}

async function buildMessageFromItem(
    item: TransactionItem,
    walletAddress: Address
): Promise<MessageRelaxed> {
    switch (item.type) {
        case 'ton':
            return buildTonTransferMessage(item);
        case 'jetton':
            return buildJettonTransferMessage(item, walletAddress);
        case 'nft':
            return buildNftTransferMessage(item, walletAddress);
        default:
            throw new BadRequestError(`Unsupported item type: ${(item as any).type}`);
    }
}
```

### Backward compatibility

- Existing dApps using `messages` continue to work with no changes
- The `itemTypes` array in the feature flag is optional — if absent, the SDK will never send `items`

---

## 3. Embedded Requests

### What is it

Embedded requests allow an RPC request (e.g. a transaction) to be embedded directly into the connect URL via an `e` query parameter. This enables the wallet to handle **connection and action in a single step** — the user approves the connection and the transaction at once, instead of two separate prompts.

This feature works on **mobile only** (deep links / universal links). It does not apply to QR code scanning (desktop) or JS bridge (embedded browser).

### When it works

1. A dApp calls `sendTransaction()`, `signMessage()`, or `signData()` while the user is **not yet connected**
2. The SDK embeds the request into the wallet's connect URL as an `e` parameter
3. The user taps the wallet link on mobile → the wallet opens with both the connect request and the embedded action
4. The wallet presents the embedded action to the user (see the implementation steps below for the required response format)
5. The result is returned in the `response` field of `ConnectEventSuccess`

If the request payload is too large to fit in a URL, the SDK omits the `e` parameter and falls back to the two-step flow.

### URL format

```
https://<wallet-universal-url>?v=2&id=<session_id>&trace_id=<trace_id>&r=<ConnectRequest>&e=<base64url(EmbeddedWireRequest)>&ret=back
```

The `e` parameter contains `base64url(JSON.stringify(EmbeddedWireRequest))` — a compact wire-format JSON with abbreviated field names to minimize URL length.

### Wire format

The wire format uses short field names. Every wire request has an `m` (method) field:

| `m` value | Method            |
|-----------|-------------------|
| `st`      | `sendTransaction` |
| `sm`      | `signMessage`     |
| `sd`      | `signData`        |

For `sendTransaction` and `signMessage`:

```typescript
type TransactionWireRequest = {
    m: 'st' | 'sm';        // method
    f?: string;             // from address
    n?: string;             // network (chain id, e.g. "-239")
    vu?: number;            // valid_until (unix timestamp)
    ms?: WireMessage[];     // raw messages (mutually exclusive with `i`)
    i?: WireItem[];         // structured items (mutually exclusive with `ms`)
};
```

**WireMessage** field mapping:

| Wire field | Full name      | Type   | Required |
|------------|----------------|--------|----------|
| `a`        | address        | string | yes      |
| `am`       | amount         | string | yes      |
| `p`        | payload        | string | no       |
| `si`       | stateInit      | string | no       |
| `ec`       | extra_currency | object | no       |

**WireItem** field mappings — same types as structured items but abbreviated:

**WireTonItem** (`t: "ton"`): `a` (address), `am` (amount), `p` (payload), `si` (stateInit), `ec` (extra_currency)

**WireJettonItem** (`t: "jetton"`): `ma` (master), `d` (destination), `am` (amount), `aa` (attachAmount), `rd` (responseDestination), `cp` (customPayload), `fa` (forwardAmount), `fp` (forwardPayload), `qi` (queryId)

**WireNftItem** (`t: "nft"`): `na` (nftAddress), `no` (newOwner), `aa` (attachAmount), `rd` (responseDestination), `cp` (customPayload), `fa` (forwardAmount), `fp` (forwardPayload), `qi` (queryId)

For `signData`:

```typescript
type SignDataWireRequest = {
    m: 'sd';
    f?: string;              // from address
    n?: string;              // network
    t: 'text' | 'binary' | 'cell';
    // type-specific fields:
    tx?: string;             // text (for type "text")
    b?: string;              // bytes (for type "binary")
    s?: string;              // schema (for type "cell")
    c?: string;              // cell BoC (for type "cell")
};
```

### How to implement

#### Step 1: Include the feature

Add `EmbeddedRequest` to the wallet's `features` array to signal support:

```typescript
const features: Feature[] = [
    {
        name: 'SendTransaction',
        maxMessages: 4,
        extraCurrencySupported: true,
        itemTypes: ['ton', 'jetton', 'nft']
    },
    {
        name: 'SignMessage',
        maxMessages: 4,
        itemTypes: ['ton', 'jetton', 'nft']
    },
    { name: 'EmbeddedRequest' }
];
```

#### Step 2: Decode the `e` parameter

When the wallet opens via a universal link, check for the `e` query parameter:

```typescript
import { Buffer } from 'buffer';

function base64UrlDecode(input: string): string {
    return Buffer.from(input, 'base64url').toString('utf-8');
}

interface ParsedConnectLink {
    version: number;
    clientId: string;
    connectRequest: ConnectRequest;
    embeddedRequest?: EmbeddedWireRequest;
}

function parseConnectUrl(url: string): ParsedConnectLink {
    const parsed = new URL(url);

    const result: ParsedConnectLink = {
        version: Number(parsed.searchParams.get('v')),
        clientId: parsed.searchParams.get('id')!,
        connectRequest: JSON.parse(parsed.searchParams.get('r')!)
    };

    // Check for embedded request
    const reqParam = parsed.searchParams.get('e');
    if (reqParam) {
        const decoded = base64UrlDecode(reqParam);
        result.embeddedRequest = JSON.parse(decoded);
    }

    return result;
}
```

#### Step 3: Expand wire format to full RPC payload

Convert the abbreviated wire fields back to the standard format:

```typescript
type ExpandedRequest = {
    method: 'sendTransaction' | 'signMessage' | 'signData';
    params: [string]; // JSON string of the payload
};

function expandWireRequest(wire: EmbeddedWireRequest): ExpandedRequest {
    switch (wire.m) {
        case 'st':
        case 'sm': {
            const method = wire.m === 'st' ? 'sendTransaction' : 'signMessage';

            const payload: Record<string, unknown> = {};
            if (wire.f) payload.from = wire.f;
            if (wire.n) payload.network = wire.n;
            if (wire.vu) payload.valid_until = wire.vu;

            if (wire.i) {
                payload.items = wire.i.map(expandWireItem);
            } else if (wire.ms) {
                payload.messages = wire.ms.map(expandWireMessage);
            }

            return { method, params: [JSON.stringify(payload)] };
        }

        case 'sd': {
            const payload: Record<string, unknown> = { type: wire.t };
            if (wire.f) payload.from = wire.f;
            if (wire.n) payload.network = wire.n;

            if (wire.t === 'text') payload.text = (wire as any).tx;
            else if (wire.t === 'binary') payload.bytes = (wire as any).b;
            else if (wire.t === 'cell') {
                payload.schema = (wire as any).s;
                payload.cell = (wire as any).c;
            }

            return { method: 'signData', params: [JSON.stringify(payload)] };
        }
    }
}

function expandWireMessage(wm: WireMessage): RawMessage {
    return {
        address: wm.a,
        amount: wm.am,
        ...(wm.p ? { payload: wm.p } : {}),
        ...(wm.si ? { stateInit: wm.si } : {}),
        ...(wm.ec ? { extra_currency: wm.ec } : {})
    };
}

function expandWireItem(wi: WireItem): TransactionItem {
    switch (wi.t) {
        case 'ton':
            return {
                type: 'ton',
                address: wi.a,
                amount: wi.am,
                ...(wi.p ? { payload: wi.p } : {}),
                ...(wi.si ? { stateInit: wi.si } : {}),
                ...(wi.ec ? { extra_currency: wi.ec } : {})
            };
        case 'jetton':
            return {
                type: 'jetton',
                master: wi.ma,
                destination: wi.d,
                amount: wi.am,
                ...(wi.aa ? { attachAmount: wi.aa } : {}),
                ...(wi.rd ? { responseDestination: wi.rd } : {}),
                ...(wi.cp ? { customPayload: wi.cp } : {}),
                ...(wi.fa ? { forwardAmount: wi.fa } : {}),
                ...(wi.fp ? { forwardPayload: wi.fp } : {}),
                ...(wi.qi ? { queryId: wi.qi } : {})
            };
        case 'nft':
            return {
                type: 'nft',
                nftAddress: wi.na,
                newOwner: wi.no,
                ...(wi.aa ? { attachAmount: wi.aa } : {}),
                ...(wi.rd ? { responseDestination: wi.rd } : {}),
                ...(wi.cp ? { customPayload: wi.cp } : {}),
                ...(wi.fa ? { forwardAmount: wi.fa } : {}),
                ...(wi.fp ? { forwardPayload: wi.fp } : {}),
                ...(wi.qi ? { queryId: wi.qi } : {})
            };
    }
}
```

#### Step 4: Process and respond

When a connect URL contains an `e` parameter the wallet must present the user with both the connect request and the embedded action. **How the wallet presents this to the user is entirely up to the wallet** — it may show one combined screen, or two sequential screens, or any other UX. The spec only defines the response.

There are exactly three valid outcomes, and the wallet sends **a single message** to the bridge for all of them:

| Outcome | What to send |
|---------|-------------|
| User rejects the connection | `connect_error` event — no `response` field |
| User approves connection and approves the embedded request | `connect` event with `response: { result: ... }` |
| User approves connection but rejects the embedded request | `connect` event with `response: { error: ... }` |

In all cases only one bridge message is sent. There is no separate RPC response message.

```typescript
async function handleConnectWithEmbeddedRequest(
    connectRequest: ConnectRequest,
    embeddedWire: EmbeddedWireRequest
): Promise<ConnectEvent> {
    // 1. Present connection to the user (existing logic)
    const connectApproved = await askUserToApproveConnect(connectRequest);
    if (!connectApproved) {
        // Outcome 1: connect rejected — standard error event, no response field
        return { event: 'connect_error', id: getNextEventId(), payload: { code: 300, message: 'User declined the connection' } };
    }
    const connectPayload = await buildConnectPayload(connectRequest);

    // 2. Present the embedded request to the user
    const expanded = expandWireRequest(embeddedWire);
    const rpcResult = await processRpcRequest(expanded);
    // rpcResult is either { result: ... } (approved) or { error: ... } (rejected)

    // 3. Send a single ConnectEventSuccess that includes the RPC outcome
    return {
        event: 'connect',
        id: getNextEventId(),
        payload: connectPayload,
        response: rpcResult   // present regardless of whether the request was approved or rejected
    };
}
```

The `response` field follows the standard `WalletResponse` format:

**On success** — the `response.result` value depends on the method:

- `sendTransaction` → `"te6ccg...base64boc..."` (BoC string)
- `signMessage` → `{ "internalBoc": "te6ccg...base64boc..." }`
- `signData` → `{ "signature": "...", "address": "...", ... }`

Example for `sendTransaction`:

```json
{
  "event": "connect",
  "id": 1,
  "payload": {
    "items": [{ "name": "ton_addr", "...": "..." }],
    "device": { "...": "..." }
  },
  "response": {
    "result": "te6ccg...base64boc..."
  }
}
```

**On error:**

```json
{
  "event": "connect",
  "id": 1,
  "payload": {
    "items": [
      {
        "name": "ton_addr",
        "...": "..."
      }
    ],
    "device": {
      "...": "..."
    }
  },
  "response": {
    "error": {
      "code": 300,
      "message": "User declined the request"
    }
  }
}
```

Note: unlike regular RPC responses, the connect response does **not** contain an `id` field, because the request was not assigned an ID by the app.

#### Step 5: Handle the case when `e` is not recognized

If your wallet doesn't support embedded requests (or receives a malformed `e`), simply **ignore the parameter** and process the connection normally. The `ConnectEventSuccess` will have no `response` field, and the SDK will fall back to sending the request over the bridge after the connection is established.

### Backward compatibility

| Scenario                              | Behavior                                 |
|---------------------------------------|------------------------------------------|
| Old wallet receives URL with `e`      | Ignores unknown param, connects normally |
| New wallet receives URL without `e`   | Standard connect flow                    |
| `e` contains unsupported method       | Wallet ignores `e`, connects normally  |

---

## Feature Summary

Here is a complete example of a `DeviceInfo.features` array for a wallet that supports all three features:

```typescript
const features: Feature[] = [
    {
        name: 'SendTransaction',
        maxMessages: 255,
        extraCurrencySupported: true,
        itemTypes: ['ton', 'jetton', 'nft']
    },
    {
        name: 'SignData',
        types: ['text', 'binary', 'cell']
    },
    {
        name: 'SignMessage',
        maxMessages: 255,
        extraCurrencySupported: true,
        itemTypes: ['ton', 'jetton', 'nft']
    },
    { name: 'EmbeddedRequest' }
];
```

---

## Updating the Wallets List

After implementing the new features in your wallet, update your entry in the [wallets-list](https://github.com/ton-blockchain/wallets-list) registry so the SDK knows about your capabilities.

### 1. Fork and edit `wallets-v2.json`

Find your wallet's entry in [`wallets-v2.json`](https://github.com/ton-blockchain/wallets-list/blob/main/wallets-v2.json) and update the `features` array. For example, if your wallet now supports all three features:

```json
{
  "app_name": "your_wallet",
  "name": "Your Wallet",
  "image": "https://example.com/icon.png",
  "about_url": "https://example.com",
  "universal_url": "https://example.com/ton-connect",
  "bridge": [
    {
      "type": "sse",
      "url": "https://bridge.example.com"
    }
  ],
  "platforms": [
    "ios",
    "android"
  ],
  "features": [
    {
      "name": "SendTransaction",
      "maxMessages": 255,
      "extraCurrencySupported": true,
      "itemTypes": [
        "ton",
        "jetton",
        "nft"
      ]
    },
    {
      "name": "SignData",
      "types": [
        "text",
        "binary",
        "cell"
      ]
    },
    {
      "name": "SignMessage",
      "maxMessages": 255,
      "extraCurrencySupported": true,
      "itemTypes": [
        "ton",
        "jetton",
        "nft"
      ]
    },
    {
      "name": "EmbeddedRequest"
    }
  ]
}
```

Only include features and item types your wallet actually supports.

### 2. Submit a pull request

Open a PR against the `main` branch of [`ton-blockchain/wallets-list`](https://github.com/ton-blockchain/wallets-list). The repo has automated tests that validate JSON schema — make sure your entry matches [`wallets-v2.schema.json`](https://github.com/ton-blockchain/wallets-list/blob/main/wallets-v2.schema.json).

### 3. Feature fields reference

| Feature           | Required fields                                 | Optional fields                       |
|-------------------|-------------------------------------------------|---------------------------------------|
| `SendTransaction` | `name`, `maxMessages`, `extraCurrencySupported` | `itemTypes`                           |
| `SignData`        | `name`, `types`                                 | —                                     |
| `SignMessage`     | `name`, `maxMessages`                           | `extraCurrencySupported`, `itemTypes` |
| `EmbeddedRequest` | `name`                                          | —                                     |

- `itemTypes` — array of `"ton"`, `"jetton"`, `"nft"`. Omit entirely if your wallet only supports raw `messages`.
- `extraCurrencySupported` — required for `SendTransaction`, optional for `SignMessage` (defaults to `false`).
- `types` (SignData) — array of `"text"`, `"binary"`, `"cell"`.

---

## See Also

- [Requests and Responses spec](https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md) — full protocol definition
- [Wallets List repo](https://github.com/ton-blockchain/wallets-list) — registry of TON Connect wallets
- [Wallets V2 JSON schema](https://github.com/ton-blockchain/wallets-list/blob/main/wallets-v2.schema.json) — entry validation schema

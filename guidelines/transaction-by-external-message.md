# 🔍 Transaction Lookup Using External Message from TON Connect

This guide shows how to find the transaction associated with an `external-in` message on the TON blockchain.  

## 🧱 Message Normalization

In TON, messages may contain fields like `init`, `src` and `importFee`. These fields should be removed or zeroed out before calculating the message hash, as described in [TEP-467](https://github.com/ton-blockchain/TEPs/blob/8b3beda2d8611c90ec02a18bec946f5e33a80091/text/0467-normalized-message-hash.md).

Use the function below to generate a **normalized message hash**:

```ts
/**
 * Generates a normalized hash of an "external-in" message for comparison.
 *
 * This function ensures consistent hashing of external-in messages by following [TEP-467](https://github.com/ton-blockchain/TEPs/blob/8b3beda2d8611c90ec02a18bec946f5e33a80091/text/0467-normalized-message-hash.md):
 *
 * @param {Message} message - The message to be normalized and hashed. Must be of type `"external-in"`.
 * @returns {Buffer} The hash of the normalized message.
 * @throws {Error} if the message type is not `"external-in"`.
 */
export function getNormalizedExtMessageHash(message: Message) {
    if (message.info.type !== 'external-in') {
        throw new Error(`Message must be "external-in", got ${message.info.type}`);
    }

    const info = {
         ...message.info,
         src: undefined,
         importFee: 0n
    };

    const normalizedMessage = {
        ...message,
        init: null,
        info: info,
    };

    return beginCell()
        .store(storeMessage(normalizedMessage, { forceRef: true }))
        .endCell()
        .hash();
}
```

## 🔁 Retrying API Calls

Sometimes API requests may fail due to rate limits or network issues. Use `retry` function presented below to deal with api failures:

```ts
export async function retry<T>(fn: () => Promise<T>, options: { retries: number; delay: number }): Promise<T> {
    let lastError: Error | undefined;
    for (let i = 0; i < options.retries; i++) {
        try {
            return await fn();
        } catch (e) {
            if (e instanceof Error) {
                lastError = e;
            }
            await new Promise((resolve) => setTimeout(resolve, options.delay));
        }
    }
    throw lastError;
}
```

## 🔎 Find the Transaction by Incoming Message

The `getTransactionByInMessage` function searches the account’s transaction history for a match by normalized external message hash:

```ts
/**
 * Tries to find transaction by ExternalInMessage
 */
async function getTransactionByInMessage(
    inMessageBoc: string,
    client: TonClient,
): Promise<Transaction | undefined> {
    // Step 1. Convert Base64 boc to Message if input is a string
    const inMessage = loadMessage(Cell.fromBase64(inMessageBoc).beginParse());

    // Step 2. Ensure the message is an external-in message
    if (inMessage.info.type !== 'external-in') {
        throw new Error(`Message must be "external-in", got ${inMessage.info.type}`);
    }
    const account = inMessage.info.dest;

    // Step 3. Compute the normalized hash of the input message
    const targetInMessageHash = getNormalizedExtMessageHash(inMessage);

    let lt: string | undefined = undefined;
    let hash: string | undefined = undefined;

    // Step 4. Paginate through transaction history of account
    while (true) {
        const transactions = await retry(
            () =>
                client.getTransactions(account, {
                    hash,
                    lt,
                    limit: 10,
                    archival: true,
                }),
            { delay: 1000, retries: 3 },
        );

        if (transactions.length === 0) {
            // No more transactions found - message may not be processed yet
            return undefined;
        }

        // Step 5. Search for a transaction whose input message matches the normalized hash
        for (const transaction of transactions) {
            if (transaction.inMessage?.info.type !== 'external-in') {
                continue;
            }

            const inMessageHash = getNormalizedExtMessageHash(transaction.inMessage);
            if (inMessageHash.equals(targetInMessageHash)) {
                return transaction;
            }
        }

        const last = transactions.at(-1)!;
        lt = last.lt.toString();
        hash = last.hash().toString('base64');
    }
}
```

If found, it returns a `Transaction` object. Otherwise, it returns `undefined`.

### Example

```ts
import { TonClient } from '@ton/ton';

const client = new TonClient({ endpoint: 'https://toncenter.com/api/v2/jsonRPC' });

const tx = await getTransactionByInMessage(
  'te6ccgEBAQEA...your-base64-message...',
  client
);

if (tx) {
  console.log('Found transaction:', tx);
} else {
  console.log('Transaction not found');
}
```

## ⏳ Waiting for Transaction Confirmation

If you’ve just sent a message, it may take a few seconds before it appears on-chain.
The function `waitForTransaction` to poll the blockchain and wait for the corresponding transaction should be used in this case:

```ts
/**
 * Waits for a transaction to appear on-chain by incoming external message.
 *
 * Useful when the message has just been sent.
 */
async function waitForTransaction(
    inMessageBoc: string,
    client: TonClient,
    retries: number = 10,
    timeout: number = 1000,
): Promise<Transaction | undefined> {
    const inMessage = loadMessage(Cell.fromBase64(inMessageBoc).beginParse());

    if (inMessage.info.type !== 'external-in') {
        throw new Error(`Message must be "external-in", got ${inMessage.info.type}`);
    }
    const account = inMessage.info.dest;

    const targetInMessageHash = getNormalizedExtMessageHash(inMessage);

    let attempt = 0;
    while (attempt < retries) {
        console.log(`Waiting for transaction to appear in network. Attempt: ${attempt}`);

        const transactions = await retry(
            () =>
                client.getTransactions(account, {
                    limit: 10,
                    archival: true,
                }),
            { delay: 1000, retries: 3 },
        );

        for (const transaction of transactions) {
            if (transaction.inMessage?.info.type !== 'external-in') {
                continue;
            }

            const inMessageHash = getNormalizedExtMessageHash(transaction.inMessage);
            if (inMessageHash.equals(targetInMessageHash)) {
                return transaction;
            }
        }

        await new Promise((resolve) => setTimeout(resolve, timeout));
    }

    // Transaction was not found - message may not be processed
    return undefined;
}
```

### Example

```typescript
import { TonClient } from '@ton/ton';

const client = new TonClient({ endpoint: 'https://toncenter.com/api/v2/jsonRPC' });

const [tonConnectUI, setOptions] = useTonConnectUI();

// Obtain ExternalInMessage boc
const { boc } = await tonConnectUI.sendTransaction({
    messages: [
        {
            address: "UQBSzBN6cnxDwDjn_IQXqgU8OJXUMcol9pxyL-yLkpKzYpKR",
            amount: "20000000"
        }
    ]
});

const tx = await waitForTransaction(
    boc,
    client,
    10, // retries
    1000, // timeout before each retry
);

if (tx) {
    console.log('Found transaction:', tx);
} else {
    console.log('Transaction not found');
}
```

## 📚 See Also

* [TEP-467: Normalized Message Hash](https://github.com/ton-blockchain/TEPs/blob/8b3beda2d8611c90ec02a18bec946f5e33a80091/text/0467-normalized-message-hash.md)
* [Messages and transactions](https://docs.ton.org/v3/documentation/smart-contracts/message-management/messages-and-transactions)
* [TON Connect: Sending messages](https://docs.ton.org/v3/guidelines/ton-connect/guidelines/sending-messages#sending-the-messages)
* [TON Cookbook: Basics of Message Processing](https://docs.ton.org/v3/guidelines/dapps/cookbook#basics-of-message-processing)

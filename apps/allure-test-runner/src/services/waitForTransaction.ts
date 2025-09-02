import { beginCell, storeMessage } from '@ton/core';
import { Cell, loadMessage, TonClient, type Transaction } from '@ton/ton';

function endpointByNetwork(network: 'mainnet' | 'testnet') {
    return `https://${network === 'testnet' ? 'testnet.' : ''}toncenter.com/api/v2/jsonRPC`;
}

function getNormalizedExtMessageHash(message: any) {
    if (message.info.type !== 'external-in') {
        throw new Error(`Message must be "external-in", got ${message.info.type}`);
    }
    const info = { ...message.info, src: undefined, importFee: 0n };
    const normalizedMessage = { ...message, init: null, info };
    return beginCell()
        .store(storeMessage(normalizedMessage, { forceRef: true }))
        .endCell()
        .hash();
}

async function retry<T>(
    fn: () => Promise<T>,
    options: { retries: number; delay: number }
): Promise<T> {
    let lastError: Error | undefined;
    for (let i = 0; i < options.retries; i++) {
        try {
            return await fn();
        } catch (e) {
            if (e instanceof Error) lastError = e;
            await new Promise(resolve => setTimeout(resolve, options.delay));
        }
    }

    throw lastError!;
}

export async function waitForTransaction(inMessageBoc: string, network: 'mainnet' | 'testnet') {
    const client = new TonClient({ endpoint: endpointByNetwork(network) });

    const inMessage = loadMessage(Cell.fromBase64(inMessageBoc).beginParse());
    if (inMessage.info.type !== 'external-in') {
        throw new Error(`Message must be "external-in", got ${inMessage.info.type}`);
    }
    const account = inMessage.info.dest;
    const targetHash = getNormalizedExtMessageHash(inMessage);

    const maxAttempts = 30;
    const delayMs = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const transactions = await retry(
            () => client.getTransactions(account, { limit: 10, archival: true }),
            { retries: 3, delay: 1000 }
        );

        const match = transactions.find(t => {
            if (t.inMessage?.info.type !== 'external-in') return false;
            const h = getNormalizedExtMessageHash(t.inMessage);
            return h.equals(targetHash);
        }) as Transaction | undefined;

        if (match) {
            const hash = match.hash().toString('base64');
            const base = `https://tonviewer.com/transaction/${encodeURIComponent(hash)}`;
            return network === 'testnet' ? `${base}?testnet=1` : base;
        }

        await new Promise(r => setTimeout(r, delayMs));
    }

    return null;
}

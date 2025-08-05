import { HttpResponseResolver } from 'msw';
import { TonClient } from '@ton/ton';
import { Cell, loadMessage, Transaction } from '@ton/core';

import { badRequest, notFound, ok } from '../utils/http-utils';
import { getNormalizedExtMessageHash, retry } from '../utils/transactions-utils';



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

/**
 * POST /api/find_transaction_by_external_message
 * Body: { boc: string, network: 'mainnet' | 'testnet' }
 * Returns: { transaction: any | undefined }
 */
export const findTransactionByExternalMessage: HttpResponseResolver = async ({ request }) => {
    try {
        const body = (await request.json()) as any;
        const boc = body.boc;
        const network = body.network;
        if (typeof boc !== 'string' || (network !== 'mainnet' && network !== 'testnet')) {
            return badRequest({ error: 'Invalid request body' });
        }

        const client = new TonClient({
            endpoint: `https://${network === 'testnet' ? 'tesnet.' : ''}toncenter.com/api/v2/jsonRPC`,
        });

        const transaction = await getTransactionByInMessage(boc, client);
        if (!transaction) {
            return notFound({ error: 'Transaction not found' });
        }

        return ok({ transaction: { ...transaction, hash: transaction.hash().toString('base64') } });
    } catch (e) {
        return badRequest({ error: 'Invalid request', trace: e instanceof Error ? e.message : e });
    }
}; 